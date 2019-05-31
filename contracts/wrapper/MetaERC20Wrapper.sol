pragma solidity ^0.5.9;
pragma experimental ABIEncoderV2;

import "multi-token-standard/contracts/interfaces/IERC20.sol";
import "multi-token-standard/contracts/tokens/ERC1155/ERC1155Meta.sol";
import "multi-token-standard/contracts/tokens/ERC1155/ERC1155MintBurn.sol";


/**
 * @dev Allows users to wrap any amount of any ERC-20 token with a 1:1 ratio of
 *
 *      corresponding ERC-1155 tokens with native metaTransaction methods.
 * TO DO:
 *  - Add 1 tx wrap (via CREATE2)
 *  - Review function descriptions
 *  - Add meta-withdraw
 *
 */
contract MetaERC20Wrapper is ERC1155Meta, ERC1155MintBurn {

  // Address for tokens representing Ether is 0x00...00
  address internal ETH_ADDRESS = address(0x0);

  // onReceive function signatures
  bytes4 constant internal ERC1155_RECEIVED_VALUE = 0xf23a6e61;
  bytes4 constant internal ERC1155_BATCH_RECEIVED_VALUE = 0xbc197c81;


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
   * @param _token The addess of the token to deposit in this contract
   * @param _value The amount of token to deposit in this contract
   * Note: Users must first approve this contract addres on the contract of the ERC20 to be deposited
   */
  function deposit(address _token, uint256 _value)
    public payable
  {
    // Deposit ERC-20 tokens or ETH
    if (_token != ETH_ADDRESS) {
      require(msg.value == 0, "MetaERC20Wrapper#deposit: INCORRECT_MSG_VALUE");
      IERC20(_token).transferFrom(msg.sender, address(this), _value);
      require(checkSuccess(), "MetaERC20Wrapper#deposit: TRANSFER_FAILED");
    } else {
      require(_value == msg.value, "MetaERC20Wrapper#deposit: INCORRECT_MSG_VALUE");
    }

    // Mint meta tokens
    _mint(msg.sender, uint256(_token), _value);
  }


  /***********************************|
  |         Withdraw Functions        |
  |__________________________________*/

  /**
   * @dev Withdraw wrapped ERC20 tokens in this contract to receive the original ERC20s or ETH
   * @param _token The addess of the token to withdrww from this contract
   * @param _to The address where the withdrawn tokens will go to
   * @param _value The amount of tokens to withdraw
   */
  function withdraw(address _token, address payable _to, uint256 _value)
    public
  {
    // Burn meta tokens
    _burn(msg.sender, uint256(_token), _value);

    // Withdraw ERC-20 tokens or ETH
    if (_token != ETH_ADDRESS) {
      IERC20(_token).transfer(_to, _value);
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
    withdraw(address(_id), _from, _value);
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
    for ( uint256 i = 0; i < _ids.length; i++){
      withdraw(address(_ids[i]), _from, _values[i]);
    }
    return ERC1155_BATCH_RECEIVED_VALUE;
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