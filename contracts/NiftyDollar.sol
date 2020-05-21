pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NiftyDollar is ERC20    {

    constructor(uint256 initialSupply) ERC20("Nifty Dollar", "NUSD") public {
        _mint(msg.sender, initialSupply);
    }

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}