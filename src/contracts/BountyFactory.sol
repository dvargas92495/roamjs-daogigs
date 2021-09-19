pragma solidity ^0.8.7;
import './Bounty.sol';

contract BountyFactory {
    uint public bountyCount = 0;
    mapping(uint => Bounty) public bounties;

    constructor() {}

    event BountyDeployed(
        uint id
    );

    function deploy() external payable {
        uint index = bountyCount++;
        bounties[index] = (new Bounty){value: msg.value}(msg.sender);
        emit BountyDeployed(index);
    }
}
