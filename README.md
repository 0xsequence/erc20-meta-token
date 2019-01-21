# General Meta Transaction Wrapper Contract for ERC20
Wrapper contract offering meta-transaction methods to any token compliant with the ERC-20 standard.

# How does it work?
When you deposit ERC-20 tokens (e.g. DAI) in the wrapper contract, it will give you back metaTokens (e.g. MetaDAI) with a 1:1 ratio. These metaToken have native meta-transaction functionalities, which allow you to transfer tokens without doing an on-chain transaction yourself, but by simply signing a message and broadcasting this message to "executors". You can also "approve" addresses to transfer tokens on your behalf with a signed message instead of calling the ERC-20 `approve()` function. 

You can, at anytime, convert back these metaTokens back to their original tokens by calling the `withdraw()` method. 

