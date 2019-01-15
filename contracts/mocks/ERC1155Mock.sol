pragma solidity ^0.5.0;

import "../token/ERC1155.sol";


contract ERC1155Mock is ERC1155 {

  function mockMint(address _to, uint256 _id, uint256 _value) public {
    balances[_to][_id] = balances[_to][_id].add(_value);
  }

}