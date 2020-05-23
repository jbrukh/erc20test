pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PredictionMarket {

    // state
    uint256 internal currentPrice = 0.0;
    IERC20 internal niftyDollar;
    mapping (address => uint256) balances;
    uint internal expirationBlock = 2**256 - 1; // max uint256
    uint internal challengePeriodBlock = 0;
    uint internal CHALLENGE_PERIOD_BLOCKS = 1;
    uint internal EXPIRATION_BLOCKS = 5;

    // public state
    address public niftyDollarAddr;


    // events
    event PredictPriceUp(address indexed predictor, uint256 amount, uint256 assetPrice);
    event PredictPriceDown(address indexed predictor, uint256 amount, uint256 assetPrice);

    constructor(address _niftyDollarAddr) public {
        niftyDollarAddr = _niftyDollarAddr;
        niftyDollar = IERC20(niftyDollarAddr);
        expirationBlock = block.number + EXPIRATION_BLOCKS; // TODO: make expiration a parameter
    }

    modifier atLeast(uint256 amount, uint256 minimum) {
        require(amount >= minimum, "The amount must be more than the minimum.");
        _;
    }

    modifier onlyAfterExpiration() {
        require(block.number > expirationBlock, "The market is still active.");
        _;
    }

    modifier onlyBeforeExpiration() {
        require(block.number <= expirationBlock, "The market is now closed.");
        _;
    }

    /**
     * @dev 
     */
    modifier onlyAfterChallengePeriod() {
        require(block.number > challengePeriodBlock, "The challenge period is not over yet.");
        _;
    }

    /**
     * @dev Get the current price of the prediction market.
     */
    function getCurrentPrice() external view returns (uint256) {
        return currentPrice;
    }

    function allowedToBuy() external view returns (bool) {
        return block.number > challengePeriodBlock;
    }

    /**
     * @dev Move the prediction price up by ``amount``.
     */
    function predictPriceUp(uint256 _amount) external atLeast(_amount, 1.0) onlyBeforeExpiration {
        // send
        niftyDollar.transferFrom(msg.sender, address(this), _amount);

        // track balance
        balances[msg.sender] += _amount;

        // accounting
        currentPrice += _amount;

        // challenge period
        challengePeriodBlock = block.number + CHALLENGE_PERIOD_BLOCKS;

        // event
        emit PredictPriceUp(msg.sender, _amount, currentPrice);
    }

    /**
     * @dev Move the prediction price down by ``amount``.
     */
    function predictPriceDown(uint256 _amount) external atLeast(_amount, 1.0) onlyBeforeExpiration {
        // cannot make the current price lower than 0
        require(_amount < currentPrice, "The amount cannot me more than current price.");

        // send
        niftyDollar.transferFrom(msg.sender, address(this), _amount);

        // track balance
        balances[msg.sender] += _amount;

        // accounting
        currentPrice -= _amount;

        // challenge period
        challengePeriodBlock = block.number + CHALLENGE_PERIOD_BLOCKS;

        // event
        emit PredictPriceDown(msg.sender, _amount, currentPrice);
    }

    /**
     * @dev Returns the balance of a given address.
     */
    function getBalance(address addr) external view returns (uint256) {
        return balances[addr];
    }

    function getChallengeBlock() external view returns (uint) {
        return challengePeriodBlock;
    }

    /**
     * @dev Withdraw any active balance from the contract.
     */
    function withdraw() external onlyAfterExpiration {
        require(balances[msg.sender] > 0, "Sender has no balance.");
        uint256 _amount = balances[msg.sender];
        delete balances[msg.sender];
        niftyDollar.transferFrom(address(this), msg.sender, _amount);
    }

    function buy() external onlyAfterChallengePeriod {
        
    }

}