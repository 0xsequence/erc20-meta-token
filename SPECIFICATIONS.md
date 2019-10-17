# ERC-20 Meta Wrapper Specification

## Overview

MetaERC20Wrapper is a general wrapper contract offering meta-transaction methods to any token compliant with the ERC-20 standard. When you deposit ERC-20 tokens (e.g. DAI) in the wrapper contract, it will give you back metaTokens (e.g. MetaDAI) with a 1:1 ratio. These metaToken have native meta-transaction functionalities which allows you to transfer tokens without doing an on-chain transaction yourself, but by simply signing a message and broadcasting this message to "executors". You can also "approve" addresses to transfer tokens on your behalf with a signed message instead of calling the ERC-20 `approve()` function. For more information on meta-transaction, see [Multi-Token Standard Specification]()

You can, at anytime, convert back these metaTokens back to their original tokens by calling the `withdraw()` method.

# Contracts
## MetaERC20Wrapper.sol

The `MetaERC20Wrapper` contract is responsible for:

1. Depositing ERC20 tokens
2. Withdrawing ERC20 tokens

## NOTE: Reserved ID
token ID `1` is reserved for Ether, and the address representing Ether in the contract is `address(0x1)`

# Contract Interactions
## deposit

The `deposit` function receives a ERC20 token and mints metaTokens to the sender 

```solidity
  /**
   * @dev Deposit ERC20 tokens or ETH in this contract to receive wrapped ERC20s
   * @param _token The addess of the token to deposit in this contract
   * @param _value The amount of token to deposit in this contract
   */
  function deposit(address _token, uint256 _value)
    public payable
  {
```

`deposit` executes the following:

- transfers the ERC20 token to the wrapper contract, and checks for success
- register and assign an internal token id to track ERC20 addresses
- metaTokens is minted to the deposit sender (1:1)

For details on minted metaTokens, see [Multi-Token Standard Specification]()

`deposit` will revert under the following conditions:
- `msg.value` is non empty when trying to deposit a ERC20 token
- `checkSuccess()` returns false for ERC20 token transfer
- `msg.value` does not match with `_value` when trying to deposit Ether


One prerequisite for a successful deposit is that users must first approve this contract address on the contract of the ERC20 to be deposited, so the contract can transfer tokens on the user's behalf

All ERC20 compliant tokens should have this method available to be invoked:

```solidity
function approve(address _spender, uint256 _value) public returns (bool success)
```

## withdraw

The `withdraw` function receives a metaToken and returns the original ERC20 token that was deposited.

```solidity
  /**
   * @dev Withdraw wrapped ERC20 tokens in this contract to receive the original ERC20s or ETH
   * @param _token The addess of the token to withdrww from this contract
   * @param _to The address where the withdrawn tokens will go to
   * @param _value The amount of tokens to withdraw
   */
  function withdraw(address _token, address payable _to, uint256 _value) public {
```
`withdraw` executes the following:
- burns the metaTokens by transfering it to `0x00..0`
- transfers the originally deposited ERC20 tokens back to the sender

`withdraw` will revert under the following conditions:
- `checkSuccess()` returns false for ERC20 token transfer
- `_to` is an invalid recipient address

# Other Methods

### *getTokenID(address _token)*

This method will return the meta token id for an ERC20 token address

### *getIdAddress(uint256 _id)*

This method will return ERC20 token address for an meta token ID

### *getNTokens()*

This method will return the total number of token types currently in the contract 

### *checkSuccess()*

Checks the return value of the previous function up to 32 bytes. Returns true if the previous function returned 0 bytes or 32 bytes that are not all-zero ([Referece](https://github.com/dydxprotocol/protocol_v1/blob/5c8d83e6c143c4ba3bbb65ee6c1758a409652aef/contracts/lib/TokenInteract.sol#L122)).