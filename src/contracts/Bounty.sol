// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Bounty {
  enum State {
    AWAITING_HUNTER,
    AWAITING_DELIVERY,
    COMPLETE
  }
  State public currState;

  mapping(address => uint256) public sources;
  address public hunter;
  string public tokenType = "ETHER";

  constructor(address source) payable {
    sources[source] = msg.value;
    currState = State.AWAITING_HUNTER;
  }

  function fund() external payable {
    require(currState == State.AWAITING_HUNTER, "Already claimed");
    sources[msg.sender] += msg.value;
  }

  function claim() external {
    require(
      sources[msg.sender] == 0 && currState == State.AWAITING_HUNTER,
      "Bounty source cannot claim bounty"
    );
    hunter = msg.sender;
    currState = State.AWAITING_DELIVERY;
  }

  function confirmBounty() external {
    require(
      sources[msg.sender] > 0,
      "Only a bounty source can call this method"
    );
    require(
      currState == State.AWAITING_DELIVERY,
      "Cannot confirm without claim"
    );
    (bool success, ) = hunter.call{ value: sources[msg.sender] }("");
    require(success, "ETH transfer failed.");
    sources[msg.sender] = 0;
    if (address(this).balance == 0) {
      currState = State.COMPLETE;
    } 
  }
}
