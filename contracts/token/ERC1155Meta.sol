pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./ERC1155MintBurn.sol";
import "../utils/LibBytes.sol";
import "../signature/SignatureValidator.sol";


/**
 * @dev Multi-Fungible Tokens with additional functions. These additional functions allow users
 *      to presign function calls and allow third parties to execute these on their behalf.
 *      These methods allow for native meta transactions.
 */
contract ERC1155Meta is ERC1155MintBurn, SignatureValidator {
  using LibBytes for bytes;

  // Gas Receipt
  struct GasReceipt {
    uint32 gasLimit;              // Max amount of gas that can be reimbursed
    uint32 baseGas;               // Base gas cost (includes things like 21k, data encoding, etc.)
    uint128 gasPrice;             // Price denominated in token X per gas unit
    address feeToken;             // Token to pay for gas ??? Can be self by default?
    address payable feeRecipient; // Address to send payment to
  }

  /**
   * TO DO:
   *  - Support contract validator signature type?
   *  - Gas payment with arbitrary token
   *  - Add meta batch transfer
   *  - Add meta-wrap
   *  - Add 1 tx wrap (via CREATE2)
   *  - Add meta-withdraw
   *  - Add unwrap on receive method
   *  - Tests for meta approvals
   */

  // Signature nonce per address
  mapping (address => uint256) internal nonces;

  // Meta transfer identifier (no gas reimbursement):
  //    bytes4(keccak256("metaSafeTransferFrom(address,address,uint256,uint256,bytes)"));
  bytes4 internal constant METATRANSFER_FLAG = 0xebc71fa5;

  // Meta transfer identifier (with gas reimbursement):
  //    bytes4(keccak256("metaSafeTransferFromWithGasReceipt(address,address,uint256,uint256,bytes)"));
  bytes4 internal constant METATRANSFER_WITHOUT_GAS_RECEIPT_FLAG = 0x3fed7708;

  //
  // Signature Based Transfer methods
  //

  /**
   * @dev Allow anyone with a valid signature to transfer on the bahalf of _from
   * @param _from The address which you want to send tokens from
   * @param _to The address which you want to transfer to
   * @param _id Token id to update balance of - For this implementation, via `uint256(tokenAddress)`.
   * @param _value The amount of tokens of provided token ID to be transferred
   * @param _data Encodes a meta transfer indicator, gas payment receipt, signature and extra transfer data.
   *          _data should be encoded as (bytes4 METATRANSFER_FLAG, bytes32 r, bytes32 s, uint8 v, SignatureType sigType, GasReceipt g, bytes data)
   *          isMetaTx should be 0xebc71fa5 for meta transfer, or anything else for regular transfer
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

    if (_data.length < 4) {
      super.safeTransferFrom(_from, _to, _id, _value, _data);

    } else {
      // Get metatransaction tag
      bytes4 metaTag = _data.readBytes4(0);

      // Is NOT metaTransfer - (explicit check)
      if (metaTag != METATRANSFER_FLAG && metaTag != METATRANSFER_WITHOUT_GAS_RECEIPT_FLAG) {
        super.safeTransferFrom(_from, _to, _id, _value, _data);

      } else {
        bytes memory signedData;
        bytes memory transferData;
        GasReceipt memory gasTx;

        // If Gas receipt is being passed
        if (metaTag == METATRANSFER_FLAG) {
          signedData = validateTransferSignature(_from, _to, _id, _value, _data);
          (gasTx, transferData) = abi.decode(signedData, (GasReceipt, bytes));
          transferData = _data;

        } else {
          transferData = validateTransferSignature(_from, _to, _id, _value, _data);
        }

        // Update balances
        balances[_from][_id] = balances[_from][_id].sub(_value); // Subtract value
        balances[_to][_id] = balances[_to][_id].add(_value);     // Add value

        // Check if recipient is contract
        if (_to.isContract()) {
          bytes4 retval = IERC1155TokenReceiver(_to).onERC1155Received(msg.sender, _from, _id, _value, transferData);
          require(retval == ERC1155_RECEIVED_VALUE, "ERC1155Meta#safeTransferFrom: INVALID_ON_RECEIVE_MESSAGE");
        }

        // Emit event
        emit TransferSingle(msg.sender, _from, _to, _id, _value);
      }
    }
  }

  function validateTransferSignature(
    address _from,
    address _to,
    uint256 _id,
    uint256 _value,
    bytes memory _data)
    internal returns (bytes memory signedData)
  { 
    bytes4 tag;
    bytes memory sig;
    bytes memory signedData;

    // Check if one or more byte arrays are included.
    // Index 64 indicates the index at which the first byte arrays
    // start. Hence, if the start of the first byte arrays is not 64,
    // this implies that at least one other byte array was included
    // uint256 sigIndex = _data.readUint256(32);
    // require(sigIndex == 64 || sigIndex == 96, 'ERC1155Meta#validateTransferSignature: INVALID_BYTE_ARRAYS_ENCODING');

    // Get signature and data to sign
    // if (sigIndex == 96) {
    (tag, sig, signedData) = abi.decode(_data, (bytes4, bytes, bytes));

    // No gas receipt or transferData was included
    // } else {
      // (tag, sig) = abi.decode(_data, (bytes4, bytes));
      // signedData = '';
    // }

    // Get signer's currently available nonce
    uint256 nonce = nonces[_from];

    // Get data that formed the hash
    bytes memory data = abi.encodePacked(address(this), _from, _to, _id,  _value, nonce, signedData);

    // Verify if _from is the signer
    require(isValidSignature(_from, data, sig), "ERC1155Meta#safeTransferFrom: INVALID_SIGNATURE");

    //Update signature nonce
    nonces[_from] += 1;

    return signedData;
  }

  //
  // Operator Function
  //

  // /**
  //  * @dev Approve the passed address to spend on behalf of _from if valid signature is provided.
  //  * @param _owner Address that wants to set operator status  _spender.
  //  * @param _operator The address which will act as an operator for _owner.
  //  * @param _approved _operator"s new operator status (true or false).
  //  * @param _data Encodes a meta approval signature and gas payment receipt.
  //  *          _data should be encoded as (bytes1 GASRECEIPT_FLAG, GasReceipt g, bytes32 r, bytes32 s, uint8 v, SignatureType sigType)
  //  *          GASRECEIPT_FLAG should be 1 if gas receipt is being past, 0 if not
  //  */
  // function metaSetApprovalForAll(address _owner, address _operator,  bool _approved, bytes memory _data)
  //   public
  // {
  //   // Get signer's currently available nonce
  //   uint256 nonce = nonces[_owner];

  //   // Encode data for signature validation
  //   bytes memory data = abi.encodePacked(address(this), _operator, _approved, nonce);

  //   // Verify if _owner is the signer
  //   require(isValidSignature(_owner, data, _sig), "ERC1155Meta#sigSetApprovalForAll: INVALID_SIGNATURE");

  //   // Update signature nonce of _owner
  //   nonces[_owner] += 1;

  //   // Update operator status
  //   operators[_owner][_operator] = _approved;

  //   // Emit event
  //   emit ApprovalForAll(_owner, _operator, _approved);
  // }

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

