pragma solidity ^0.6.2;

import "@nomiclabs/buidler/console.sol";
contract Counter {
  uint256 count = 0;
  event CountedTo(uint256 number);

  function countUp() public returns (uint256) {
    uint256 newCount = count + 1;
    require(newCount > count, "Uint256 overflow");
    console.log("Increasing counter from %d to %d", count, newCount);
    count = newCount;
    emit CountedTo(count);
    return count;
  }

  function countDown() public returns (uint256) {
    uint256 newCount = count - 1;
    require(newCount < count, "Uint256 underflow");
    console.log("Decreasing counter from %d to %d", count, newCount);
    count = newCount;
    emit CountedTo(count);
    return count;
  }

  function getCount() public view returns (uint256) {
      return count;
  }
}