// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;
import "./libraries/Secp256k1_noconflict.sol";

contract SimpleStorage {
  uint storedData;

  function set(uint x) public {
    storedData = x;
  }

  function addFive() public {
    storedData += 5;
  }

  function checkPubKey(uint[2] xG) public returns (bool){
    return Secp256k1_noconflict.isPubKey(xG);
  }

  function get() public view returns (uint) {
    return storedData;
  }
}
