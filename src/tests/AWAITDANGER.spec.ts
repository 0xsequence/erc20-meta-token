import * as ethers from 'ethers'

import { AbstractContract, expect, RevertError, BigNumber } from './utils'
import * as utils from './utils'

import { SignatureValidator } from 'typings/contracts/SignatureValidator'

// init test wallets from package.json mnemonic
const web3 = (global as any).web3

const {
  wallet: signerWallet,
  provider: signerProvider,
  signer: signerSigner
} = utils.createTestWallet(web3, 0)

contract('AWAIT DANGER', (accounts: string[]) => {

  let signerAddress: string
  let signatureValidatorAbstract: AbstractContract
  let signatureValidatorContract: SignatureValidator

  // load contract abi and deploy to test server
  before(async () => {
    signerAddress = await signerWallet.getAddress()
    signatureValidatorAbstract = await AbstractContract.fromArtifactName('SignatureValidator')
  })

  // deploy before each test, to reset state of contract
  beforeEach(async () => {
    signatureValidatorContract = await signatureValidatorAbstract.deploy(signerWallet) as SignatureValidator 
  })

  describe('isValidSignature() Function', () => {

    let data = ethers.utils.toUtf8Bytes('Did the Ethereum blockchain reach 1TB yet? No.')
    let ethsig;
    let eip712sig;

    beforeEach(async () => {
      ethsig = await signerWallet.signMessage(data)
    })

    // await statement before the `expect()` statement
    it.only('REVERTS AS EXPECTED: contains `await` statement', async () => {
      // @ts-ignore
      const tx = signatureValidatorContract.functions.isValidSignature(signerAddress, data, ethsig + '00')
      await expect(tx).to.be.rejectedWith( RevertError("SignatureValidator#isValidSignature: UNSUPPORTED_SIGNATURE") )    
    }) // ^^^^ FAILS

    // No await statement before the `expect()` statement
    it.only('DOES NOT REVERT AS EXPECTED: Does not contain `await` statement', async () => {
      // @ts-ignore
      const tx = signatureValidatorContract.functions.isValidSignature(signerAddress, data, ethsig + '00')
      expect(tx).to.be.rejectedWith( RevertError("SignatureValidator#isValidSignature: UNSUPPORTED_SIGNATURE") )   
    }) // ^^^^^ SHOULD FAIL, BUT PASSES 

  })
})  
 