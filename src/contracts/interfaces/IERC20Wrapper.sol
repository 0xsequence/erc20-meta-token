pragma solidity ^0.8.0;

import "@0xsequence/erc-1155/contracts/interfaces/IERC1155.sol";

interface IERC20Wrapper is IERC1155 {

  /***********************************|
  |         Deposit Functions         |
  |__________________________________*/

  /**
   * Fallback function
   * @dev Deposit ETH in this contract to receive wrapped ETH
   */
  receive () external payable;

  /**
   * @dev Deposit ERC20 tokens or ETH in this contract to receive wrapped ERC20s
   * @param _token     The addess of the token to deposit in this contract
   * @param _recipient Address that will receive the ERC-1155 tokens
   * @param _value     The amount of token to deposit in this contract
   * Note: Users must first approve this contract addres on the contract of the ERC20 to be deposited
   */
  function deposit(address _token, address _recipient, uint256 _value) external payable;


  /***********************************|
  |         Withdraw Functions        |
  |__________________________________*/

  /**
   * @dev Withdraw wrapped ERC20 tokens in this contract to receive the original ERC20s or ETH
   * @param _token The addess of the token to withdrww from this contract
   * @param _to The address where the withdrawn tokens will go to
   * @param _value The amount of tokens to withdraw
   */
  function withdraw(address _token, address payable _to, uint256 _value) external;


  /***********************************|
  |         Getter Functions          |
  |__________________________________*/

  /**
   * @notice Return the Meta-ERC20 token ID for the given ERC-20 token address
   * @param _token ERC-20 token address to get the corresponding Meta-ERC20 token ID
   * @return tokenID Meta-ERC20 token ID
   */
  function getTokenID(address _token) external view returns (uint256 tokenID);

  /**
   * @notice Return the ERC-20 token address for the given Meta-ERC20 token ID
   * @param _id Meta-ERC20 token ID to get the corresponding ERC-20 token address
   * @return token ERC-20 token address
   */
  function getIdAddress(uint256 _id) external view returns (address token) ;

  /**
   * @notice Returns number of tokens currently registered
   */
  function getNTokens() external view;


  /***********************************|
  |        OnReceive Functions        |
  |__________________________________*/

  /**
   * @notice Withdraw ERC-20 tokens when receiving their ERC-1155 counterpart
   * @param _operator  The address which called the `safeTransferFrom` function
   * @param _from      The address which previously owned the token
   * @param _id        The id of the token being transferred
   * @param _value     The amount of tokens being transferred
   * @param _data      Additional data with no specified format
   * @return           `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
   */
  function onERC1155Received(address _operator, address payable _from, uint256 _id, uint256 _value, bytes calldata _data ) external returns(bytes4);

  /**
   * @notice Withdraw ERC-20 tokens when receiving their ERC-1155 counterpart
   * @param _operator  The address which called the `safeBatchTransferFrom` function
   * @param _from      The address which previously owned the token
   * @param _ids       An array containing ids of each token being transferred
   * @param _values    An array containing amounts of each token being transferred
   * @param _data      Additional data with no specified format
   * @return           `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
   */
  function onERC1155BatchReceived(address _operator, address payable _from, uint256[] calldata _ids, uint256[] calldata _values, bytes calldata _data) external returns(bytes4);
}
