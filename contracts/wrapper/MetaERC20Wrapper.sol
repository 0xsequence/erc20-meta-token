// solhint-disable
pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../token/ERC1155MintBurn.sol";


contract MetaERC20Wrapper is ERC1155MintBurn {

  // Address for tokens representing Ether is 0x00...00
  address internal ETH_ADDRESS = address(0x0); 

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
  function deposit(address _token, uint256 _value) public payable {

    // If ERC20 to deposit
    if (_token != ETH_ADDRESS) {

      // Transfer tokens to this contract
      IERC20(_token).transferFrom(msg.sender, address(this), _value);

      // Check if transfer was successful
      require(checkSuccess(), "MetaERC20Wrapper#deposit: TRANSFER_FAILED");

    // If ETH to deposit 
    } else {

      // Value should equal amount of ETH
      require(_value == msg.value, "MetaERC20Wrapper#deposit: INSUFFICIENT_ETH");

    }

    // Mint meta tokens
    mint(msg.sender, uint256(_token), _value);
  }

  // /**
  //  * @dev Withdraw wrapped ERC20 tokens in this contract to receive the original ERC20s or ETH
  //  * @param _token The addess of the token to withdrww from this contract
  //  * @param _to The address where the withdrawn tokens will go to 
  //  * @param _value The amount of tokens to withdraw
  //  */
  // function withdraw(address _token, address payable _to, uint256 _value) public {

  //   // Burn meta tokens
  //   burn(msg.sender, uint256(_token), _value);

  //   // If ERC20 to withdraw
  //   if (_token != ETH_ADDRESS) {

  //     // Transfer tokens to this contract
  //     IERC20(_token).transfer(_to, _value);

  //     // Check if transfer was successful
  //     require(checkSuccess(), "MetaERC20Wrapper#withdraw: TRANSFER_FAILED");

  //    // If ETH to withdraw 
  //   } else {

  //     // Transfer corresponding ETH to recipient
  //     _to.transfer(_value);

  //   }
  // }

  // ============ Private Helper-Functions ============

  /**
    * Checks the return value of the previous function up to 32 bytes. Returns true if the previous
    * function returned 0 bytes or 32 bytes that are not all-zero.
    * Code taken from: https://github.com/dydxprotocol/protocol/blob/5c8d83e6c143c4ba3bbb65ee6c1758a409652aef/contracts/lib/TokenInteract.sol
    */
  function checkSuccess(
  )
    private
    pure
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