pragma solidity ^0.5.0;

contract Bounty {
    string public name;
    enum State { AWAITING_PAYMENT, AWAITING_HUNTER, AWAITING_DELIVERY, COMPLETE }
    State public currState;
    
    address public source;
    address payable public hunter;

    constructor() public {
        source = msg.sender;
        currState = State.AWAITING_PAYMENT;
    }

    modifier onlySource() {
        require(msg.sender == source, "Only bounty source can call this method");
        _;
    }

    function fund() onlySource external payable {
        require(currState == State.AWAITING_PAYMENT, "Already funded");
        currState = State.AWAITING_HUNTER;
    }

    function claim() external {
        require(msg.sender != source, "Bounty source cannot claim bounty");
        hunter = msg.sender;
        currState = State.AWAITING_DELIVERY;
    }

    function confirmBounty() onlySource external {
        require(currState == State.AWAITING_DELIVERY, "Cannot confirm without funding");
        hunter.transfer(address(this).balance);
        currState = State.COMPLETE;
    }
}
