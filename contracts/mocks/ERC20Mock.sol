pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {

  function mockMint(address _address, uint256 _amount) public {
    _mint(_address, _amount);
  }

}