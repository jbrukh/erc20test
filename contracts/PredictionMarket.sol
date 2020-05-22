pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PredictionMarket {

    // state
    uint256 internal currentPrice = 0.0;
    IERC20 internal niftyDollar;
    mapping (address => uint256) balances;
    uint internal expirationBlock = 0;

    // public state
    address public niftyDollarAddr;

    constructor(address _niftyDollarAddr) public {
        niftyDollarAddr = _niftyDollarAddr;
        niftyDollar = IERC20(niftyDollarAddr);
        expirationBlock = block.number + 250; // TODO: make expiration a parameter
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
     * @dev Get the current price of the prediction market.
     */
    function getCurrentPrice() external view returns (uint256) {
        return currentPrice;
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
    }

    /**
     * @dev Returns the balance of a given address.
     */
    function getBalance(address addr) external view returns (uint256) {
        return balances[addr];
    }

    /**
     * @dev Withdraw any active balance from the contract.
     */
    function withdraw() external onlyAfterExpiration {
        require(balances[msg.sender] > 0, "Sender has no balance.");
        uint256 _amount = balances[msg.sender];
        niftyDollar.transferFrom(address(this), msg.sender, _amount);
    }

}