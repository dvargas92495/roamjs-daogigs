// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenBounty {
  enum State {
    AWAITING_HUNTER,
    AWAITING_DELIVERY,
    COMPLETE
  }
  State public currState;

  mapping(address => uint256) public sources;
  address public hunter;
  IERC20 tokenType;

  constructor(address source, address token) payable {
    sources[source] = msg.value;
    currState = State.AWAITING_HUNTER;
    tokenType = IERC20(token);
  }

  modifier onlySource() {
    require(
      sources[msg.sender] > 0,
      "Only a bounty source can call this method"
    );
    _;
  }

  function fund(uint256 value) external payable onlySource {
    require(currState == State.AWAITING_HUNTER, "Already claimed");
    currState = State.AWAITING_HUNTER;
    tokenType.approve(address(this), value);
    require(
      value >= tokenType.allowance(msg.sender, address(this)),
      "Please approve tokens before transferring"
    );
    tokenType.transfer(address(this), value);
    sources[msg.sender] += value;
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
    uint256 value = sources[msg.sender];
    tokenType.approve(hunter, value);
    require(
      value > tokenType.allowance(address(this), hunter),
      "Please approve tokens before transferring"
    );
    tokenType.transfer(hunter, value);
    sources[msg.sender] = 0;
  }
}
