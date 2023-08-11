pragma solidity ^0.8.0;

import "@0xsequence/erc-1155/contracts/interfaces/IERC20.sol";
import "@0xsequence/erc-1155/contracts/interfaces/IERC165.sol";
import "@0xsequence/erc-1155/contracts/interfaces/IERC1155.sol";
import "@0xsequence/erc-1155/contracts/interfaces/IERC1155TokenReceiver.sol";
import "@0xsequence/erc-1155/contracts/tokens/ERC1155/ERC1155Meta.sol";
import "@0xsequence/erc-1155/contracts/tokens/ERC1155/ERC1155MintBurn.sol";


/**
 * @notice Allows users to wrap any amount of any ERC-20 token with a 1:1 ratio
 *   of corresponding ERC-1155 tokens with native metaTransaction methods. Each
 *   ERC-20 is assigned an ERC-1155 id for more efficient CALLDATA usage when
 *   doing transfers.
 */
contract MetaERC20Wrapper is ERC1155Meta, ERC1155MintBurn {

  // Variables
  uint256 internal nTokens = 1;                         // Number of ERC-20 tokens registered
  uint256 constant internal ETH_ID = 0x1;               // ID fo tokens representing Ether is 1
  address constant internal ETH_ADDRESS = address(0x1); // Address for tokens representing Ether is 0x00...01
  mapping (address => uint256) internal addressToID;    // Maps the ERC-20 addresses to their metaERC20 id
  mapping (uint256 => address) internal IDtoAddress;    // Maps the metaERC20 ids to their ERC-20 address


  /***********************************|
  |               Events              |
  |__________________________________*/

  event TokenRegistration(address token_address, uint256 token_id);

  /***********************************|
  |            Constructor            |
  |__________________________________*/

  // Register ETH as ID #1 and address 0x1
  constructor() {
    addressToID[ETH_ADDRESS] = ETH_ID;
    IDtoAddress[ETH_ID] = ETH_ADDRESS;
  }

  /***********************************|
  |         Deposit Functions         |
  |__________________________________*/

  /**
   * Fallback function
   * @dev Deposit ETH in this contract to receive wrapped ETH
   * No parameters provided
   */
  receive () external payable {
    // Deposit ETH sent with transaction
    deposit(ETH_ADDRESS, msg.sender, msg.value);
  }

  /**
   * @dev Deposit ERC20 tokens or ETH in this contract to receive wrapped ERC20s
   * @param _token     The addess of the token to deposit in this contract
   * @param _recipient Address that will receive the ERC-1155 tokens
   * @param _value     The amount of token to deposit in this contract
   * Note: Users must first approve this contract addres on the contract of the ERC20 to be deposited
   */
  function deposit(address _token, address _recipient, uint256 _value)
    public payable
  {
    require(_recipient != address(0x0), "MetaERC20Wrapper#deposit: INVALID_RECIPIENT");

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

        // Emit registration event
        emit TokenRegistration(_token, id);

      } else {
        id = addressId;
      }

    } else {
      require(_value == msg.value, "MetaERC20Wrapper#deposit: INCORRECT_MSG_VALUE");
      id = ETH_ID;
    }

    // Mint meta tokens
    _mint(_recipient, id, _value, "");
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
    if (_tokenID != ETH_ID) {
      address token = IDtoAddress[_tokenID];
      IERC20(token).transfer(_to, _value);
      require(checkSuccess(), "MetaERC20Wrapper#withdraw: TRANSFER_FAILED");

    } else {
      require(_to != address(0), "MetaERC20Wrapper#withdraw: INVALID_RECIPIENT");
      (bool success, ) = _to.call{value: _value}("");
      require(success, "MetaERC20Wrapper#withdraw: TRANSFER_FAILED");
    }


  }
  /**
   * @notice Withdraw ERC-20 tokens when receiving their ERC-1155 counterpart
   * @param _from      The address which previously owned the token
   * @param _id        The id of the token being transferred
   * @param _value     The amount of tokens being transferred
   * @return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
   */
  function onERC1155Received(address, address payable _from, uint256 _id, uint256 _value, bytes memory)
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
   * @param _from      The address which previously owned the token
   * @param _ids       An array containing ids of each token being transferred
   * @param _values    An array containing amounts of each token being transferred
   * @return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
   */
  function onERC1155BatchReceived(address, address payable _from, uint256[] memory _ids, uint256[] memory _values, bytes memory)
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
   * @return tokenID Meta-ERC20 token ID
   */
  function getTokenID(address _token) public view returns (uint256 tokenID) {
    tokenID = addressToID[_token];
    require(tokenID != 0, "MetaERC20Wrapper#getTokenID: UNREGISTERED_TOKEN");
    return tokenID;
  }

  /**
   * @notice Return the ERC-20 token address for the given Meta-ERC20 token ID
   * @param _id Meta-ERC20 token ID to get the corresponding ERC-20 token address
   * @return token ERC-20 token address
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
    * Code taken from: https://github.com/dydxprotocol/solo/blob/10baf8e4c3fb9db4d0919043d3e6fdd6ba834046/contracts/protocol/lib/Token.sol
    */
  function checkSuccess()
    private pure
    returns (bool)
  {
    uint256 returnValue = 0;

    /* solium-disable-next-line security/no-inline-assembly */
    assembly {
      // check number of bytes returned from last function call
      switch returndatasize()

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

  /**
   * @notice Indicates whether a contract implements the `ERC1155TokenReceiver` functions and so can accept ERC1155 token types.
   * @param  interfaceID The ERC-165 interface ID that is queried for support.
   * @dev This function MUST return true if it implements the ERC1155TokenReceiver interface and ERC-165 interface.
   *      This function MUST NOT consume more than 5,000 gas.
   * @return Whether ERC-165 or ERC1155TokenReceiver interfaces are supported.
   */
  function supportsInterface(bytes4 interfaceID) public override view returns (bool) {
    return  interfaceID == type(IERC165).interfaceId ||
      interfaceID == type(IERC1155).interfaceId || 
      interfaceID == type(IERC1155TokenReceiver).interfaceId;
  }

}
