pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./ERC1155MintBurn.sol";
import "../signature/SignatureValidator.sol";


/**
 * @dev Multi-Fungible Tokens with additional functions. These additional functions allow users
 *      to presign function calls and allow third parties to execute these on their behalf. 
 *      These methods allow for native meta transactions.
 */ 
contract ERC1155Meta is ERC1155MintBurn, SignatureValidator { 

    /**
   * TO DO:
   *  - Add tests
   *  - Support contract validator signature type?
   *  - Gas payment with arbitrary token
   *  - Add meta batch transfer
   *  - Add scope approvals?
   *  - Add meta-deposits
   *  - Add meta-withdraw
   *  - Optimize packing and unpacking
   */

  // Signature nonce per address
  mapping (address => uint256) internal nonces;

  //
  // Signature Based Transfer methods
  //

  /**
   * @dev Allow anyone with a valid signature to transfer on the bahalf of _from
   * @param _from The address which you want to send tokens from
   * @param _to The address which you want to transfer to
   * @param _id Token id to update balance of - For this implementation, via `uint256(tokenAddress)`.
   * @param _value The amount of tokens of provided token ID to be transferred
   * @param _data Contains a valid signature of length 65 (v,r,s variables from ecdsa signature)
   *         any additional data for onReceive function must be added after the signature.
   */
  function safeTransferFrom(
    address _from,
    address _to, 
    uint256 _id, 
    uint256 _value,
    bytes memory _data) 
    public 
  {
    require(_to != address(0), "ERC1155Meta#safeTransferFrom: INVALID_RECIPIENT");

    // Extract sig and data from _sigAndData
    (bytes32 r, bytes32 s, uint8 v, bytes memory transferData) = abi.decode(_data, (bytes32, bytes32, uint8, bytes));
    
    // Pack rsv into sig
    bytes memory sig = abi.encodePacked(r,s,v);

    // Get signer's currently available nonce
    uint256 nonce = nonces[_from];

    // Get data that formed the hash
    bytes memory data = abi.encodePacked(address(this), _from, _to, _id,  _value, transferData, nonce);

    // Verify if _from is the signer
    require(isValidSignature(_from, data, sig), "ERC1155Meta#safeTransferFrom: INVALID_SIGNATURE");
 
    //Update signature nonce
    nonces[_from] += 1;

    // Update balances
    balances[_from][_id] = balances[_from][_id].sub(_value); // Subtract value
    balances[_to][_id] = balances[_to][_id].add(_value);      // Add value

    if (_to.isContract()) {
      bytes4 retval = IERC1155TokenReceiver(_to).onERC1155Received(msg.sender, _from, _id, _value, transferData);
      require(retval == ERC1155_RECEIVED_VALUE, "ERC1155Meta#safeTransferFrom: INVALID_ON_RECEIVE_MESSAGE");
    }

    // Emit event
    emit TransferSingle(msg.sender, _from, _to, _id, _value);
  } 

  //
  // Operator Functions
  //

  /**
   * @dev Approve the passed address to spend on behalf of _from if valid signature is provided.
   * @param _owner Address that wants to set operator status  _spender.
   * @param _operator The address which will act as an operator for _owner.
   * @param _approved _operator"s new operator status (true or false). 
   * @param _sig Bytes array containing signature related variables.
   */
  function sigSetApprovalForAll(address _owner, address _operator,  bool _approved, bytes memory _sig) 
    public  
  {  

    // Get signer's currently available nonce
    uint256 nonce = nonces[_owner];

    // Encode data for signature validation
    bytes memory data = abi.encodePacked(address(this), _operator, _approved, nonce);

    // Verify if _owner is the signer
    require(isValidSignature(_owner, data, _sig), "ERC1155Meta#sigSetApprovalForAll: INVALID_SIGNATURE");

    // Update signature nonce of _owner
    nonces[_owner] += 1;

    // Update operator status
    operators[_owner][_operator] = _approved;

    // Emit event
    emit ApprovalForAll(_owner, _operator, _approved);
  }

  // 
  // Signature View Functions               
  // 

  /**
  * @dev Returns the current nonce associated with a given address
  * @param _signer Address to query signature nonce for
  */
  function getNonce(address _signer) 
    external view returns (uint256 nonce) 
  {
    return nonces[_signer];
  }

}

