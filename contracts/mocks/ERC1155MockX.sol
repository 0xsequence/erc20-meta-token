pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../token/ERC1155X.sol";


contract ERC1155XMock is ERC1155X {

  function mockMint(address _to, uint256 _id, uint256 _value) public {
    balances[_to][_id] = balances[_to][_id].add(_value);
  }
  
}
