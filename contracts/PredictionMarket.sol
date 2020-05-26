pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PredictionMarket {

    // constants
    uint internal CHALLENGE_PERIOD_BLOCKS = 5;
    uint internal CLAIM_PERIOD_BLOCKS = 10;
    
    // state
    uint256 internal currentPrice = 0.0;
    uint256 internal challengeBlock = 2**256 - 1; // max
    uint256 internal claimPeriodBlock = 2**256 - 1; // max
    uint256 internal index = 0;
    uint256 internal totalCorrectClaims = 0; // the amount of capital which claimed a correct prediction
    bool internal marketEnded;
    
    // accounting
    mapping (address => uint256) deposits;
    mapping (address => uint256) correctClaims;
    mapping (address => bool) claimed;

    // events
    event PredictPriceAbove(address indexed predictor, uint256 amount, uint256 assetPrice);
    event PredictPriceBelow(address indexed predictor, uint256 amount, uint256 assetPrice);

    // Side
    enum Side { Buy, Sell }

    // Prediction
    struct Prediction {
        uint256 index;
        address predictor;
        Side side;
        uint256 amount;
        uint256 resultingPrice;
    }

    mapping (address => Prediction[]) predictions;

    // The prediction market currency
    IERC20 internal niftyDollar;

    /**
     * @dev Create a new prediction market with ``niftyDollarAddr`` as the transaction currency.
     */
    constructor(address niftyDollarAddr) public {
        niftyDollar = IERC20(niftyDollarAddr);
    }

     /**
     * @dev Get the current price of the prediction market.
     */
    function getCurrentPrice() external view returns (uint256) {
        return currentPrice;
    }

    /**
     * @dev Returns the total deposits.
     */
    function getDeposits(address addr) external view returns (uint256) {
        return deposits[addr];
    }

    /**
     * @dev Get the block at which the challenge period will end and buys will be possible.
     */
    function getChallengeBlock() external view returns (uint) {
        return challengeBlock;
    }

    /**
     * @dev Get the block at which the claim period ends.
     */
    function getClaimPeriodBlock() external view returns (uint) {
        return claimPeriodBlock;
    }

    /**
     * @dev The ``amount`` should be at least ``minimum``.
     */
    modifier atLeast(uint256 amount, uint256 minimum) {
        require(amount >= minimum, "The amount must be more than the minimum.");
        _;
    }

    /**
     * @dev Only after the asset has been purchased.
     */
    modifier onlyAfterMarketEnded() {
        require(marketEnded, "The market is still open.");
        _;
    }

    /**
     * @dev Only before the asset is sold and market is still open.
     */
    modifier onlyBeforeMarketEnded() {
        require(!marketEnded, "The market has ended.");
        _;
    }

    /**
     * @dev Only after the challenge period expires.
     */
    modifier onlyAfterChallengePeriod() {
        require(block.number > challengeBlock, "The market is still in the challenge period.");
        _;
    }

    /**
     * @dev Only before the challenge period expires.
     */
    modifier onlyBeforeChallengePeriod() {
        require(block.number <= challengeBlock, "The challenge period has ended.");
        _;
    }

    /**
     * @dev Only during the claim period.
     */
    modifier onlyDuringClaimPeriod() {
        require(marketEnded && block.number < claimPeriodBlock, "The market is not in claim period.");
        _;
    }

    modifier onlyAfterClaimPeriod() {
        require(marketEnded && block.number >= claimPeriodBlock, "The market did not complete the claim period yet.");
        _;
    }

    modifier onlyIfNotClaimed() {
        require(!claimed[msg.sender], "You have already claimed your deposits.");
        _;
    }


    //
    // Workflow
    //
    // Market is created ->
    // Predictors moveMarket(), extending the challenge period until it expires ->
    // Buyer buys() the asset ->
    // Predictors claim their rewards, until the claim period expires ->
    // Predictors withdraw their capital
    //

    /**
     * @dev Internal method which enforces the rules for moving the market and making predictions.
     */
    function _moveMarket(uint256 amount, Side side) internal atLeast(amount, 1.0) onlyBeforeMarketEnded {
        // send
        niftyDollar.transferFrom(msg.sender, address(this), amount);

        // track balance
        deposits[msg.sender] += amount; // TODO: safe math

        // calculate new price
        index += 1;
        uint256 delta = amount / index;
        if (side == Side.Buy) {
            currentPrice += delta;
        } else if (side == Side.Sell) {
            require(delta < currentPrice, "You cannot move the market by more than the current price.");
            currentPrice -= delta;
        }

        // challenge period is extended
        challengeBlock = block.number + CHALLENGE_PERIOD_BLOCKS;

        // push prediction
        predictions[msg.sender].push(Prediction({
            index: index,
            predictor: msg.sender,
            side: side,
            amount: amount,
            resultingPrice: currentPrice
        }));
    }

    /**
     * @dev Move the market up by adding an ``amount`` of capital. The market
     *      will move by ``amount`` / ``index``, where index represents the count
     *      of predictions submitted, including this one.
     */
    function moveMarketUp(uint256 amount) external {
        _moveMarket(amount, Side.Buy);
        emit PredictPriceAbove(msg.sender, amount, currentPrice);
    }

    function moveMarketDown(uint256 amount) external {
        _moveMarket(amount, Side.Sell);
        emit PredictPriceBelow(msg.sender, amount, currentPrice);
    }

    function buy() external onlyAfterChallengePeriod {
        uint256 buyPrice = currentPrice;

        // get the payment
        niftyDollar.transferFrom(msg.sender, address(this), buyPrice);

        // make the market expire
        marketEnded = true;

        // claim rewards period
        claimPeriodBlock = block.number + CLAIM_PERIOD_BLOCKS;

        // TODO: allow the buyer to withdraw the asset or wrapper assets

        // TODO: emit purchase
    }

    function claimRewards() external onlyDuringClaimPeriod onlyIfNotClaimed {
        uint length = predictions[msg.sender].length;
        for (uint i = 0; i < length; i++) {
            Prediction memory p = predictions[msg.sender][i];
            if ((p.side == Side.Buy && currentPrice >= p.resultingPrice) ||
                 (p.side == Side.Sell && currentPrice <= p.resultingPrice)) {
                totalCorrectClaims += p.amount;
                correctClaims[msg.sender] += p.amount;
            }
        }
        claimed[msg.sender] = true;
        // TODO: emit claims
    }

    /**
     * @dev Withdraw any active balance from the contract.
     */
    function withdraw() external onlyAfterClaimPeriod {

        uint256 _deposits = deposits[msg.sender];
        require(_deposits > 0, "Sender has no balance.");
        
        uint256 _correctClaims = correctClaims[msg.sender];

        uint256 _amount = _deposits +
                          (_correctClaims / totalCorrectClaims * currentPrice) -
                          (_deposits - _correctClaims) / 20; // TODO: safe math

        delete deposits[msg.sender];
        niftyDollar.transfer(msg.sender, _amount);

        // TODO: emit withdraw
    }

}