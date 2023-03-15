@0xsequence/erc20-meta-token
============================

General ERC20 to ERC1155 Token Wrapper Contract.

Allows any ERC-20 token to be wrapped inside of an ERC-1155 contract, and thereby allows
an ERC-20 token to function as an ERC-1155 contract.

For more information see, [github.com/0xsequence/erc20-meta-token](https://github.com/0xsequence/erc20-meta-token)


## Getting started

### Install

`yarn add @0xsequence/erc20-meta-token` or `npm install @0xsequence/erc20-meta-token`

### Contract Verification

`yarn verify --network {NETWORK_NAME} "{CONTRACT_NAME}={CONTRACT_ADDRESS}"`

### Usage from Solidity

```solidity
pragma solidity ^0.8.0;

import '@0xsequence/erc20-meta-token/contracts/interfaces/IMetaERC20Wrapper.sol';

contract ContractA {
  //...
  function f(address wrapperAddress, address ERC20tokenAddress, uint256 amount) public {
    IMetaERC20Wrapper(wrapperAddress).deposit(ERC20tokenAddress, amount);
  }
}
```

## NOTES

`@0xsequence/erc20-meta-token` includes the following files in its package distribution:

* `artifacts` -- hardhat output of contract compilation
* `typings` -- ethers v5 typings for easier interfacing with the contract abis


## LICENSE

Copyright (c) 2017-present [Horizon Blockchain Games Inc](https://horizon.io).

Licensed under [Apache-2.0](https://github.com/0xsequence/erc-1155/blob/master/LICENSE)
