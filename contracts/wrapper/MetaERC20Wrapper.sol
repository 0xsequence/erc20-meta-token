pragma solidity ^0.5.9;
pragma experimental ABIEncoderV2;

import "multi-token-standard/contracts/interfaces/IERC20.sol";
import "multi-token-standard/contracts/tokens/ERC1155/ERC1155Meta.sol";
import "multi-token-standard/contracts/tokens/ERC1155/ERC1155MintBurn.sol";


/**
 * @notice Allows users to wrap any amount of any ERC-20 token with a 1:1 ratio
 *   of corresponding ERC-1155 tokens with native metaTransaction methods. Each
 *   ERC-20 is assigned an ERC-1155 id for more efficient CALLDATA usage when
 *   doing transfers.
 *
 * TO DO:
 *  - Add 1 tx wrap (via CREATE2)
 *  - Review function descriptions
 *  - Add events
 *  - ERC-1155 receiver 165
 *
 */
contract MetaERC20Wrapper is ERC1155Meta, ERC1155MintBurn {

  // Variables
  uint256 internal nTokens = 1;                      // Number of ERC-20 tokens registered
  address internal ETH_ADDRESS = address(0x1);       // Address for tokens representing Ether is 0x00...01
  mapping (address => uint256) internal addressToID; // Maps the ERC-20 addresses to their metaERC20 id
  mapping (uint256 => address) internal IDtoAddress; // Maps the metaERC20 ids to their ERC-20 address

  // onReceive function signatures
  bytes4 constant internal ERC1155_RECEIVED_VALUE = 0xf23a6e61;
  bytes4 constant internal ERC1155_BATCH_RECEIVED_VALUE = 0xbc197c81;

  // Register ETH address + ID
  constructor() public {
    addressToID[ETH_ADDRESS] = 1;
    IDtoAddress[1] = ETH_ADDRESS;
  }

  /***********************************|
  |         Deposit Functions         |
  |__________________________________*/

  /**
   * Fallback function
   * @dev Deposit ETH in this contract to receive wrapped ETH
   * No parameters provided
   */
  function() external payable {
    // Deposit ETH sent with transaction
    deposit(ETH_ADDRESS, msg.value);
  }

  /**
   * @dev Deposit ERC20 tokens or ETH in this contract to receive wrapped ERC20s
   * @param _token The address of the token to deposit in this contract
   * @param _value The amount of token to deposit in this contract
   * Note: Users must first approve this contract addres on the contract of the ERC20 to be deposited
   */
  function deposit(address _token, uint256 _value)
    public payable
  {
    // Internal ID of ERC-20 token deposited
    uint256 id;

    // Deposit ERC-20 tokens or ETH
    if (_token != ETH_ADDRESS) {

      // Check if transfer passes
      require(msg.value == 0, "MetaERC20Wrapper#deposit: NON_NULL_MSG_VALUE");
      IERC20(_token).transferFrom(msg.sender, address(this), _value);
      require(checkSuccess(), "MetaERC20Wrapper#deposit: TRANSFER_FAILED");

      // Load address token ID
      uint256 addressId = addressToID[_token];

      // Register ID if not already done
      if (addressId == 0) {
        nTokens += 1;             // Increment number of tokens registered
        id = nTokens;             // id of token is the current # of tokens
        IDtoAddress[id] = _token; // Map id to token address
        addressToID[_token] = id; // Register token

      } else {
        id = addressId;
      }

    } else {
      require(_value == msg.value, "MetaERC20Wrapper#deposit: INCORRECT_MSG_VALUE");
      id = 1;
    }

    // Mint meta tokens
    _mint(msg.sender, id, _value, "");
  }


  /***********************************|
  |         Withdraw Functions        |
  |__________________________________*/

  /**
   * @dev Withdraw wrapped ERC20 tokens in this contract to receive the original ERC20s or ETH
   * @param _token The addess of the token to withdraw from this contract
   * @param _to The address where the withdrawn tokens will go to
   * @param _value The amount of tokens to withdraw
   */
  function withdraw(address _token, address payable _to, uint256 _value) public {
    uint256 tokenID = getTokenID(_token);
    _withdraw(msg.sender, _to, tokenID, _value);
  }

  /**
   * @dev Withdraw wrapped ERC20 tokens in this contract to receive the original ERC20s or ETH
   * @param _from    Address of users sending the Meta tokens
   * @param _to      The address where the withdrawn tokens will go to
   * @param _tokenID The token ID of the ERC-20 token to withdraw from this contract
   * @param _value   The amount of tokens to withdraw
   */
  function _withdraw(
    address _from,
    address payable _to,
    uint256 _tokenID,
    uint256 _value)
    internal
  {
    // Burn meta tokens
    _burn(_from, _tokenID, _value);

     // Withdraw ERC-20 tokens or ETH
    if (_tokenID != 1) {
      address token = IDtoAddress[_tokenID];
      IERC20(token).transfer(_to, _value);
      require(checkSuccess(), "MetaERC20Wrapper#withdraw: TRANSFER_FAILED");

    } else {
      require(_to != address(0), "MetaERC20Wrapper#withdraw: INVALID_RECIPIENT");
      _to.transfer(_value);
    }


  }
  /**
   * @notice Withdraw ERC-20 tokens when receiving their ERC-1155 counterpart
   * @param _operator  The address which called the `safeTransferFrom` function
   * @param _from      The address which previously owned the token
   * @param _id        The id of the token being transferred
   * @param _value     The amount of tokens being transferred
   * @param _data      Additional data with no specified format
   * @return           `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
   */
  function onERC1155Received(address _operator, address payable _from, uint256 _id, uint256 _value, bytes memory _data )
    public returns(bytes4)
  {
    // Only ERC-1155 from this contract are valid
    require(msg.sender == address(this), "MetaERC20Wrapper#onERC1155Received: INVALID_ERC1155_RECEIVED");
    getIdAddress(_id); // Checks if id is registered

    // Tokens are received, hence need to burn them here
    _withdraw(address(this), _from, _id, _value);

    return ERC1155_RECEIVED_VALUE;
  }

  /**
   * @notice Withdraw ERC-20 tokens when receiving their ERC-1155 counterpart
   * @param _operator  The address which called the `safeBatchTransferFrom` function
   * @param _from      The address which previously owned the token
   * @param _ids       An array containing ids of each token being transferred
   * @param _values    An array containing amounts of each token being transferred
   * @param _data      Additional data with no specified format
   * @return           `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
   */
  function onERC1155BatchReceived(address _operator, address payable _from, uint256[] memory _ids, uint256[] memory _values, bytes memory _data)
    public returns(bytes4)
  {
    // Only ERC-1155 from this contract are valid
    require(msg.sender == address(this), "MetaERC20Wrapper#onERC1155BatchReceived: INVALID_ERC1155_RECEIVED");

    // Withdraw all tokens
    for ( uint256 i = 0; i < _ids.length; i++) {
      // Checks if id is registered
      getIdAddress(_ids[i]);

      // Tokens are received, hence need to burn them here
      _withdraw(address(this), _from, _ids[i], _values[i]);
    }

    return ERC1155_BATCH_RECEIVED_VALUE;
  }

  /**
   * @notice Return the Meta-ERC20 token ID for the given ERC-20 token address
   * @param _token ERC-20 token address to get the corresponding Meta-ERC20 token ID
   * @return Meta-ERC20 token ID
   */
  function getTokenID(address _token) public view returns (uint256 tokenID) {
    tokenID = addressToID[_token];
    require(tokenID != 0, "MetaERC20Wrapper#getTokenID: UNREGISTERED_TOKEN");
    return tokenID;
  }

  /**
   * @notice Return the ERC-20 token address for the given Meta-ERC20 token ID
   * @param _id Meta-ERC20 token ID to get the corresponding ERC-20 token address
   * @return ERC-20 token address
   */
  function getIdAddress(uint256 _id) public view returns (address token) {
    token = IDtoAddress[_id];
    require(token != address(0x0), "MetaERC20Wrapper#getIdAddress: UNREGISTERED_TOKEN");
    return token;
  }

  /**
   * @notice Returns number of tokens currently registered
   */
  function getNTokens() external view returns (uint256) {
    return nTokens;
  }



  /***********************************|
  |          Helper Functions         |
  |__________________________________*/

  /**
    * Checks the return value of the previous function up to 32 bytes. Returns true if the previous
    * function returned 0 bytes or 32 bytes that are not all-zero.
    * Code taken from: https://github.com/dydxprotocol/protocol/blob/5c8d83e6c143c4ba3bbb65ee6c1758a409652aef/contracts/lib/TokenInteract.sol
    */
  function checkSuccess()
    private pure
    returns (bool)
  {
    uint256 returnValue = 0;

    /* solium-disable-next-line security/no-inline-assembly */
    assembly {
      // check number of bytes returned from last function call
      switch returndatasize

      // no bytes returned: assume success
      case 0x0 {
        returnValue := 1
      }

      // 32 bytes returned: check if non-zero
      case 0x20 {
        // copy 32 bytes into scratch space
        returndatacopy(0x0, 0x0, 0x20)

        // load those bytes into returnValue
        returnValue := mload(0x0)
      }

      // not sure what was returned: dont mark as success
      default { }
    }

    return returnValue != 0;
  }

}