import * as ethers from 'ethers'

import { AbstractContract, expect, BigNumber, RevertError, encodeMetaTransferFromData } from './utils'
import * as utils from './utils'

import { toUtf8Bytes, bigNumberify } from 'ethers/utils'

import { ERC1155MetaMock } from 'typings/contracts/ERC1155MetaMock'
import { ERC1155ReceiverMock } from 'typings/contracts/ERC1155ReceiverMock'
import { ERC1155OperatorMock } from 'typings/contracts/ERC1155OperatorMock'

// init test wallets from package.json mnemonic
const web3 = (global as any).web3

const {
  wallet: ownerWallet,
  provider: ownerProvider,
  signer: ownerSigner
} = utils.createTestWallet(web3, 0)

const {
  wallet: receiverWallet,
  provider: receiverProvider,
  signer: receiverSigner
} = utils.createTestWallet(web3, 2)

const {
  wallet: operatorWallet,
  provider: operatorProvider,
  signer: operatorSigner
} = utils.createTestWallet(web3, 4)


contract('ERC1155Meta', (accounts: string[]) => {

  const MAXVAL = new BigNumber(2).pow(256).sub(1) // 2**256 - 1
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  let ownerAddress: string
  let receiverAddress: string
  let operatorAddress: string
  let erc1155Abstract: AbstractContract
  let operatorAbstract: AbstractContract

  let erc1155Contract: ERC1155MetaMock
  let operatorERC1155Contract: ERC1155MetaMock


  // load contract abi and deploy to test server
  before(async () => {
    ownerAddress = await ownerWallet.getAddress()
    receiverAddress = await receiverWallet.getAddress()
    operatorAddress = await operatorWallet.getAddress()

    erc1155Abstract = await AbstractContract.fromArtifactName('ERC1155MetaMock')
    operatorAbstract = await AbstractContract.fromArtifactName('ERC1155OperatorMock')
  })

  // deploy before each test, to reset state of contract
  beforeEach(async () => {
    erc1155Contract = await erc1155Abstract.deploy(ownerWallet) as ERC1155MetaMock 
    operatorERC1155Contract = await erc1155Contract.connect(operatorSigner) as ERC1155MetaMock
  })

  describe('safeTransferFrom() (Meta) Function', () => {

    let receiverContract: ERC1155ReceiverMock
    let operatorContract: ERC1155OperatorMock
    let METATRANSFER_IDENTIFIER = '0xebc71fa5';

    let transferData = 'Hello'
    let initBalance = 100;
    let amount = 10;
    let nonce = 0;
    let id = 66;

    let data : string;

    beforeEach(async () => {
      let abstract = await AbstractContract.fromArtifactName('ERC1155ReceiverMock')
      receiverContract = await abstract.deploy(ownerWallet) as ERC1155ReceiverMock
      operatorContract = await operatorAbstract.deploy(operatorWallet) as ERC1155OperatorMock

      // Mint tokens
      await erc1155Contract.functions.mintMock(ownerAddress, id, initBalance)

      // Data to pass in transfer method
      data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverAddress, id, amount, transferData, nonce)
    })

    it('should call parent function if data < 70 bytes', async () => {
      let dataUint8 = toUtf8Bytes("Breakthroughs! over the river! flips and crucifixions!")
      data = '0xebc71fa4' + bigNumberify(dataUint8).toHexString().slice(2)

      // Check if data lelngth is less than 70
      expect(ethers.utils.arrayify(data).length).to.be.at.most(69)

      // NOTE: typechain generates the wrong type for `bytes` type at this time
      // see https://github.com/ethereum-ts/TypeChain/issues/123
      // @ts-ignore
      const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, id, amount, data)
      await expect(tx).to.be.fulfilled
    })

    it('should call parent function if data > 70 bytes without metaTransfer identifier', async () => {
      let dataUint8 = toUtf8Bytes("Breakthroughs! over the river! flips and crucifixions! gone down the flood!")
      let data = '0xebc71fa4' + bigNumberify(dataUint8).toHexString().slice(2)

      // Check if data lelngth is more than 696
      expect(ethers.utils.arrayify(data).length).to.be.at.least(70)

      // @ts-ignore
      const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, id, amount, data)
      await expect(tx).to.be.fulfilled
    })

    it("should REVERT if data > 70 bytes and if first 4 bytes are '0xebc71fa5'", async () => {
      let dataUint8 = toUtf8Bytes("Breakthroughs! over the river! flips and crucifixions! gone down the flood!")
      let data = METATRANSFER_IDENTIFIER + bigNumberify(dataUint8).toHexString().slice(2)

      // Check if data lelngth is more than 69
      expect(ethers.utils.arrayify(data).length).to.be.at.least(70)

      // @ts-ignore
      const tx = erc1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, id, amount, data)
      await expect(tx).to.be.rejected;  
    })

    it("should REVERT if contract address is incorrect", async () => {

      data = await encodeMetaTransferFromData(receiverContract.address, ownerWallet, receiverAddress, id, amount, transferData, nonce)

      // @ts-ignore
      const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
      await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#safeTransferFrom: INVALID_SIGNATURE") )    
    })

    it("should REVERT if signer address is incorrect", async () => {

      data = await encodeMetaTransferFromData(erc1155Contract.address, operatorWallet, receiverAddress, id, amount, transferData, nonce)

      // @ts-ignore
      const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
      await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#safeTransferFrom: INVALID_SIGNATURE") )  
    })

    it("should REVERT if receiver address is incorrect", async () => {

      data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, ownerAddress, id, amount, transferData, nonce)

      // @ts-ignore
      const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
      await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#safeTransferFrom: INVALID_SIGNATURE") )  
    })

    it("should REVERT if token id is incorrect", async () => {

      data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverAddress, id + 1, amount, transferData, nonce)

      // @ts-ignore
      const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
      await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#safeTransferFrom: INVALID_SIGNATURE") )  
    })

    it("should REVERT if token amount is incorrect", async () => {

      data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverAddress, id, amount + 1, transferData, nonce)

      // @ts-ignore
      const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
      await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#safeTransferFrom: INVALID_SIGNATURE") )  
    })

    it("should REVERT if transfer data is incorrect", async () => {

      data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverAddress, id, amount, transferData, nonce)
      let extraData = bigNumberify(toUtf8Bytes('Goodbye.')).toHexString().slice(2);

      // @ts-ignore
      const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data + extraData)
      await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#safeTransferFrom: INVALID_SIGNATURE") )  
    })

    it("should REVERT if nonce is incorrect", async () => {
      data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverAddress, id, amount, transferData, nonce + 1)

      // @ts-ignore
      const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
      await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#safeTransferFrom: INVALID_SIGNATURE") )  
    })

    it("should PASS if signature is valid", async () => {
      data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverAddress, id, amount, transferData, nonce)

      // @ts-ignore
      const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
      await expect(tx).to.be.fulfilled
    })

    it('should pass if transferData is empty', async () => {
      data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverAddress, id, amount, '', nonce)
      // @ts-ignore
      const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
      await expect(tx).to.be.fulfilled
    })

    describe('When signature is valid', () => {

      it('should REVERT if insufficient balance', async () => {
        data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverAddress, id, initBalance+1, transferData, nonce)
        // @ts-ignore
        const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, initBalance+1, data)
        await expect(tx).to.be.rejectedWith( RevertError("SafeMath#sub: UNDERFLOW") ) 
      })

      it('should REVERT if sending to 0x0', async () => {
        data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, ZERO_ADDRESS, id, amount, transferData, nonce)
        // @ts-ignore
        const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, ZERO_ADDRESS, id, amount, data)
        await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#safeTransferFrom: INVALID_RECIPIENT") ) 
      })

      it('should REVERT if transfer leads to overflow', async () => {
        await erc1155Contract.functions.mintMock(receiverAddress, id, MAXVAL)
        // @ts-ignore
        const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
        await expect(tx).to.be.rejectedWith( RevertError("SafeMath#add: OVERFLOW") ) 
      })

      it('should REVERT when sending to non-receiver contract', async () => {
        data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, erc1155Contract.address, id, amount, transferData, nonce)
        // @ts-ignore
        const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, erc1155Contract.address, id, amount, data)
        await expect(tx).to.be.rejected;
      })

      it('should REVERT if invalid response from receiver contract', async () => {
        await receiverContract.functions.setShouldReject(true)
        data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverContract.address, id, amount, transferData, nonce)
        // @ts-ignore
        const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, id, amount, data)
        await expect(tx).to.be.rejectedWith( RevertError("ERC1155Meta#safeTransferFrom: INVALID_ON_RECEIVE_MESSAGE") )
      })

      it('should PASS if valid response from receiver contract', async () => {
        data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverContract.address, id, amount, transferData, nonce)
        // @ts-ignore
        const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, id, amount, data)
        await expect(tx).to.be.fulfilled
      })

      it('should pass if transferData is null when calling receiver contract', async () => {
        data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverContract.address, id, amount, '', nonce)
        // @ts-ignore
        const tx = operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverContract.address, id, amount, data)
        await expect(tx).to.be.fulfilled
      })

      context('When successful transfer', () => {
        let tx: ethers.ContractTransaction

        beforeEach(async () => {
          //@ts-ignore
          tx = await operatorERC1155Contract.functions.safeTransferFrom(ownerAddress, receiverAddress, id, amount, data)
        })

        it('should correctly update balance of sender', async () => {
          const balance = await erc1155Contract.functions.balanceOf(ownerAddress, id)
          expect(balance).to.be.eql(new BigNumber(initBalance - amount))
        })

        it('should correctly update balance of receiver', async () => {
          const balance = await erc1155Contract.functions.balanceOf(receiverAddress, id)
          expect(balance).to.be.eql(new BigNumber(amount))
        })

        describe('TransferSingle event', async () => {

          let filterFromOperatorContract: ethers.ethers.EventFilter

          it('should emit TransferSingle event', async () => {
            const receipt = await tx.wait(1)
            const ev = receipt.events!.pop()!
            expect(ev.event).to.be.eql('TransferSingle')
          })

          it('should have `msg.sender` as `_operator` field, not _from', async () => {
            const receipt = await tx.wait(1)
            const ev = receipt.events!.pop()!

            const args = ev.args! as any
            expect(args._operator).to.be.eql(operatorAddress)
          })

          it('should have `msg.sender` as `_operator` field, not tx.origin', async () => {

            // Get event filter to get internal tx event
            filterFromOperatorContract = erc1155Contract.filters.TransferSingle(operatorContract.address, null, null, null, null);

            // Set approval to operator contract
            await erc1155Contract.functions.setApprovalForAll(operatorContract.address, true)

            // Increment nonce because it's the second transfer
            data = await encodeMetaTransferFromData(erc1155Contract.address, ownerWallet, receiverAddress, id, amount, transferData, nonce + 1)

            // Execute transfer from operator contract
            // @ts-ignore (https://github.com/ethereum-ts/TypeChain/issues/118)
            await operatorContract.functions.safeTransferFrom(erc1155Contract.address, ownerAddress, receiverAddress, id, amount, data,
              {gasLimit: 1000000} // INCORRECT GAS ESTIMATION
            )

            // Get logs from internal transaction event
            // @ts-ignore (https://github.com/ethers-io/ethers.js/issues/204#issuecomment-427059031)
            filterFromOperatorContract.fromBlock = 0;
            let logs = await operatorProvider.getLogs(filterFromOperatorContract);
            let args = erc1155Contract.interface.events.TransferSingle.decode(logs[0].data, logs[0].topics)

            // operator arg should be equal to msg.sender, not tx.origin
            expect(args._operator).to.be.eql(operatorContract.address)
          })

        })
      })
    })
  })

  describe.skip('setApprovalForAll() function', () => {

    it('should emit an ApprovalForAll event', async () => {
      const tx = await erc1155Contract.functions.setApprovalForAll(operatorAddress, true)
      const receipt = await tx.wait(1)

      expect(receipt.events![0].event).to.be.eql('ApprovalForAll')
    })

    it('should set the operator status to _status argument', async () => {
      const tx = erc1155Contract.functions.setApprovalForAll(operatorAddress, true)
      await expect(tx).to.be.fulfilled

      const status = await erc1155Contract.functions.isApprovedForAll(ownerAddress, operatorAddress)
      expect(status).to.be.eql(true)
    })

    context('When the operator was already an operator', () => {
      beforeEach(async () => {
        await erc1155Contract.functions.setApprovalForAll(operatorAddress, true)
      })

      it('should leave the operator status to set to true again', async () => {
        const tx = erc1155Contract.functions.setApprovalForAll(operatorAddress, true)
        await expect(tx).to.be.fulfilled

        const status = await erc1155Contract.functions.isApprovedForAll(ownerAddress, operatorAddress)
        expect(status).to.be.eql(true)
      })

      it('should allow the operator status to be set to false', async () => {
        const tx = erc1155Contract.functions.setApprovalForAll(operatorAddress, false)
        await expect(tx).to.be.fulfilled

        const status = await erc1155Contract.functions.isApprovedForAll(operatorAddress, ownerAddress)
        expect(status).to.be.eql(false)
      })
    })

  })

})