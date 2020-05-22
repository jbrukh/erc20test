pragma solidity ^0.6.2;

contract PredictionMarket {


    bool internal isMarketOpen_ = false;
    uint256 internal currentPrice = 0.0;


    modifier marketIsOpen() {
        require(isMarketOpen_, "The market has not had any bids.");
        _;
    }

    modifier atLeast(uint256 amount, uint256 minimum) {
        require(amount >= minimum, "The amount must be more than the minimum.");
        _;
    }

    /**
     * @dev Get the current price of the prediction market.
     */
    function getCurrentPrice() external view marketIsOpen returns (uint256) {
        return currentPrice;
    }

    /**
     * @dev Returns true if and only if the market has had bids.
     */
    function isMarketOpen() external view returns (bool) {
        return isMarketOpen_;
    }

    /**
     * @dev Move the prediction price up by ``amount``.
     */
    function predictPriceUp(uint256 _amount) external atLeast(_amount, 1.0) {
        // if the market is not open, make it open
        if (!isMarketOpen_) {
            isMarketOpen_ = true;
        }

        currentPrice += _amount;
    }

    function predictPriceDown(uint256 _amount) external atLeast(_amount, 1.0) {
        // cannot make the current price lower than 0
        require(_amount < currentPrice, "The amount cannot me more than current price.");
        
        // if the market is not open, make it open
        if (!isMarketOpen_) {
            isMarketOpen_ = true;
        }

        currentPrice -= _amount;
    }

}