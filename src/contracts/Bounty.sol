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

  constructor(address source) payable {
    require(msg.value > 0, "boo where the money at");
    sources[source] = msg.value;
    currState = State.AWAITING_HUNTER;
  }

  modifier onlySource() {
    require(
      sources[msg.sender] > 0,
      "Only a bounty source can call this method"
    );
    _;
  }

  function fund() external payable onlySource {
    require(currState == State.AWAITING_HUNTER, "Already claimed");
    currState = State.AWAITING_HUNTER;
    sources[msg.sender] += msg.value;
  }

  function claim() external {
    require(sources[msg.sender] == 0, "Bounty source cannot claim bounty");
    hunter = msg.sender;
    currState = State.AWAITING_DELIVERY;
  }

  function confirmBounty() external onlySource {
    require(
      currState == State.AWAITING_DELIVERY,
      "Cannot confirm without funding"
    );
    currState = State.COMPLETE;
    (bool success, ) = hunter.call{ value: sources[msg.sender] }("");
    require(success, "ETH transfer failed.");
  }
}
