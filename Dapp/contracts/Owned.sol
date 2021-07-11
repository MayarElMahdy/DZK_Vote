pragma solidity >=0.4.21 <0.7.0;

contract Owned {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
    modifier onlyOwner {
        if (owner != msg.sender) revert();
        _;
    }
    function transferOwnership(address newOwner) onlyOwner() {
        owner = newOwner;
    }
    
}