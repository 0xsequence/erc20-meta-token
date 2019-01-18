import * as ethers from 'ethers'

import { AbstractContract, assert, expect } from './utils'
import * as utils from './utils'

import { MetaERC20Wrapper } from 'typings/contracts/MetaERC20Wrapper'
import { ERC20Mock } from 'typings/contracts/ERC20Mock'
import { BigNumber, bigNumberify } from 'ethers/utils';

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
  wallet: userWallet,
  provider: userProvider,
  signer: userSigner
} = utils.createTestWallet(web3, 3)

const {
  wallet: operatorWallet,
  provider: operatorProvider,
  signer: operatorSigner
} = utils.createTestWallet(web3, 4)


contract('MetaERC20Wrapper', (accounts: string[]) => {
  
  // Initial token balance
  const INIT_BALANCE = 100 

  // 4m gas limit when gas estimation is incorrect (internal txs) 
  const txParam = {gasLimit: 4000000}

  // Addresses
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' // Zero address
  let receiverAddress: string // Address of receiver
  let userAddress: string     // Address of user
  let tokenAddress: string    // Address of ERC20 token contract
  let wrapperAddress: string  // Address of wrapper contract

  // Contracts
  let ownerMetaERC20WrapperContract: MetaERC20Wrapper
  let userMetaERC20WrapperContract: MetaERC20Wrapper
  let userERC20Contract: ERC20Mock

  // Provider
  var provider = new ethers.providers.JsonRpcProvider()

  context.only('When MetaERC20Wrapper contract is deployed', () => {
    before(async () => {
      receiverAddress = await receiverWallet.getAddress()
      userAddress = await userWallet.getAddress()
    })

    beforeEach(async () => {
      // Deploy MetaERC20Wrapper
      let abstractMetaERC20Wrapper = await AbstractContract.fromArtifactName('MetaERC20Wrapper')
      ownerMetaERC20WrapperContract = await abstractMetaERC20Wrapper.deploy(ownerWallet) as MetaERC20Wrapper
      userMetaERC20WrapperContract = await ownerMetaERC20WrapperContract.connect(userSigner) as MetaERC20Wrapper

      // Deploy ERC20
      let abstractERC20Mock = await AbstractContract.fromArtifactName('ERC20Mock')
      userERC20Contract = await abstractERC20Mock.deploy(userWallet) as ERC20Mock

      // Mint tokens to user
      await userERC20Contract.functions.mockMint(userAddress, INIT_BALANCE)

      //@ts-ignore
      tokenAddress = userERC20Contract.address   
      //@ts-ignore
      wrapperAddress = ownerMetaERC20WrapperContract.address
    })

    describe('deposit() function', () => {

      const depositAmount = new BigNumber(20)

      describe('when depositing tokens', () => {

        it('should REVERT if user did not approve wrapper contract', async () => {
          const tx = userMetaERC20WrapperContract.functions.deposit(tokenAddress, depositAmount, txParam)
          await expect(tx).to.be.rejected
        })

        it('should REVERT if approval for wrapper contract is not sufficient', async () => {
          await userERC20Contract.functions.approve(wrapperAddress, depositAmount.sub(1))
          
          const tx = userMetaERC20WrapperContract.functions.deposit(tokenAddress, depositAmount, txParam)
          await expect(tx).to.be.rejected
        })

        context('When token contract is approved', () => {
          beforeEach(async () => {
            await userERC20Contract.functions.approve(wrapperAddress, INIT_BALANCE)
          })

          it('should REVERT if user does not have sufficient funds', async () => {
            const tx = userMetaERC20WrapperContract.functions.deposit(tokenAddress, INIT_BALANCE + 1, txParam)
            await expect(tx).to.be.rejected
          })

          it('should PASS if user has sufficient funds', async () => {
            // @ts-ignore (https://github.com/ethereum-ts/TypeChain/issues/118)
            const tx = userMetaERC20WrapperContract.functions.deposit(tokenAddress, depositAmount, txParam)
            await expect(tx).to.be.fulfilled
          })

          it('should REVERT if msg.value is not 0', async () => {
            // @ts-ignore (https://github.com/ethereum-ts/TypeChain/issues/118)
            const tx = userMetaERC20WrapperContract.functions.deposit(tokenAddress, depositAmount, {gasLimit: 1000000, value: 1})
            await expect(tx).to.be.rejected
          })
          
          context('When tokens are deposited', () => {
            beforeEach(async () => {
              await userMetaERC20WrapperContract.functions.deposit(tokenAddress, depositAmount, txParam)
            })

            it('should decrease ERC20 balance of user by the right amount', async () => {
              const balance = await userERC20Contract.functions.balanceOf(userAddress)
              expect(balance).to.be.eql(new BigNumber(INIT_BALANCE).sub(depositAmount))
            })

            it('should increase ERC20 balance of wrapper contract by the right amount', async () => {
              const balance = await userERC20Contract.functions.balanceOf(wrapperAddress)
              expect(balance).to.be.eql(depositAmount)
            })

            it('should increase ERC1155 balance of user by the right amount for given token', async () => {
              const balance = await userMetaERC20WrapperContract.functions.balanceOf(userAddress, tokenAddress)
              expect(balance).to.be.eql(depositAmount)
            })
          })


        })
    
      })

      describe('when depositing ETH', () => {

        it('should REVERT if msg.value is not equal to value', async () => {
          
          //msg.value is smaller than value
          let tx = userMetaERC20WrapperContract.functions.deposit(ZERO_ADDRESS, depositAmount, 
            {gasLimit:1000000, value: depositAmount.sub(1)}
          )
          await expect(tx).to.be.rejected
          
          // Msg.value is larger than value
          tx = userMetaERC20WrapperContract.functions.deposit(ZERO_ADDRESS, depositAmount, 
            {gasLimit:1000000, value: depositAmount.add(1)}
          )
          await expect(tx).to.be.rejected
        })

        it('should PASS if msg.value is equal to value', async () => {
          
          //msg.value is smaller than value
          let tx = userMetaERC20WrapperContract.functions.deposit(ZERO_ADDRESS, depositAmount, 
            {gasLimit:1000000, value: depositAmount}
          )
          await expect(tx).to.be.fulfilled
        })

        context('When ETH were deposited', () => {
          beforeEach(async () => {
            await userMetaERC20WrapperContract.functions.deposit(ZERO_ADDRESS, depositAmount,
              {gasLimit:1000000, value: depositAmount}
            )
          })

          it('should increase ETH balance of wrapper contract by the right amount', async () => {
            const balance = await provider.getBalance(wrapperAddress);
            expect(balance).to.be.eql(depositAmount)
          })

          it('should increase ERC1155 balance of user by the right amount for given token', async () => {
            const balance = await userMetaERC20WrapperContract.functions.balanceOf(userAddress, ZERO_ADDRESS)
            expect(balance).to.be.eql(depositAmount)
          })
          
        })
      })
    })

    describe('fallback function', () => {
      const depositAmount = new BigNumber(10)
      let txData : any

      it('should PASS if msg.value is equal to value', async () => {
        txData = {to: wrapperAddress, gasLimit: 1000000, value: depositAmount}

        let tx = userWallet.sendTransaction(txData)
        await expect(tx).to.be.fulfilled
      })

      context('When ETH were deposited', () => {
        beforeEach(async () => {
          txData = {to: wrapperAddress, gasLimit: 1000000, value: depositAmount}

          // Deposit via fallback
          await userWallet.sendTransaction(txData)
        })

        it('should increase ETH balance of wrapper contract by the right amount', async () => {
          const balance = await provider.getBalance(wrapperAddress);
          expect(balance.toNumber()).to.be.equal(depositAmount.toNumber())
        })

        it('should increase ERC1155 balance of user by the right amount for given token', async () => {
          const balance = await userMetaERC20WrapperContract.functions.balanceOf(userAddress, ZERO_ADDRESS)
          expect(balance).to.be.eql(depositAmount)
        })
      })
    })

    describe('withdraw function', () => {
      const depositAmount = new BigNumber(66)
      const withdrawAmount = depositAmount;

      describe('when withdrawing tokens', () => {

        beforeEach(async () => {
          await userERC20Contract.functions.approve(wrapperAddress, INIT_BALANCE)           // Approve tokens
          await userMetaERC20WrapperContract.functions.deposit(tokenAddress, depositAmount) // Deposit tokens
        })

        it('should REVERT if user does not have sufficient wrapped tokens', async () => {
          const tx = userMetaERC20WrapperContract.functions.withdraw(tokenAddress, userAddress, depositAmount.add(1), txParam)
          await expect(tx).to.be.rejected
        })

        it('should PASS if user has sufficient wrapped tokens', async () => {
          const tx = userMetaERC20WrapperContract.functions.withdraw(tokenAddress, userAddress, depositAmount, txParam)
          await expect(tx).to.be.fulfilled
        })

        it('should PASS when withdrawing to another address', async () => {
          const tx = userMetaERC20WrapperContract.functions.withdraw(tokenAddress, receiverAddress, depositAmount, txParam)
          await expect(tx).to.be.fulfilled
        })

        context('When tokens are withdrawn', () => {
          beforeEach(async () => {
            await userMetaERC20WrapperContract.functions.withdraw(tokenAddress, userAddress, depositAmount, txParam)
          })

          it('should decrease ERC20 balance of wrapper contract by the right amount', async () => {
            const balance = await userERC20Contract.functions.balanceOf(wrapperAddress)
            expect(balance).to.be.eql(depositAmount.sub(withdrawAmount))
          })

          it('should increase ERC20 balance of user by the right amount', async () => {
            const balance = await userERC20Contract.functions.balanceOf(userAddress)
            expect(balance).to.be.eql(new BigNumber(INIT_BALANCE).sub(depositAmount).add(withdrawAmount))
          })

          it('should decrease ERC1155 balance of user by the right amount for given token', async () => {
            const balance = await userMetaERC20WrapperContract.functions.balanceOf(userAddress, tokenAddress)
            expect(balance).to.be.eql(depositAmount.sub(withdrawAmount))
          })

        })

      })

      describe('when withdrawing ETH', () => {

        const depositAmount = new BigNumber(17)
        const withdrawAmount = depositAmount;

        beforeEach(async () => {
          // Depositing ETH
          await userMetaERC20WrapperContract.functions.deposit(ZERO_ADDRESS, depositAmount, 
            {gasLimit:1000000, value: depositAmount}
          )
        })

        it('should REVERT if user does not have sufficient wrapped tokens', async () => {
          const tx = userMetaERC20WrapperContract.functions.withdraw(ZERO_ADDRESS, userAddress, depositAmount.add(1), txParam)
          await expect(tx).to.be.rejected
        })

        it('should PASS if user has sufficient wrapped tokens', async () => {
          const tx = userMetaERC20WrapperContract.functions.withdraw(ZERO_ADDRESS, userAddress, depositAmount, txParam)
          await expect(tx).to.be.fulfilled
        })

        it('should PASS when withdrawing to another address', async () => {
          const tx = userMetaERC20WrapperContract.functions.withdraw(ZERO_ADDRESS, receiverAddress, depositAmount, txParam)
          await expect(tx).to.be.fulfilled
        })

        context('When ETH are withdrawn', () => {
          let receiverPreBalance: BigNumber

          beforeEach(async () => {
            receiverPreBalance = await provider.getBalance(receiverAddress)
            await userMetaERC20WrapperContract.functions.withdraw(ZERO_ADDRESS, receiverAddress, depositAmount, txParam)
          })

          it('should decrease ETH balance of wrapper contract by the right amount', async () => {
            const balance = await provider.getBalance(wrapperAddress)
            expect(balance.toNumber()).to.be.eql(depositAmount.sub(withdrawAmount).toNumber())
          })

          it('should increase ERC20 balance of receiver by the right amount', async () => {
            const balance = await provider.getBalance(receiverAddress)
            expect(balance).to.be.eql(receiverPreBalance.add(withdrawAmount))
          })

          it('should decrease ERC1155 balance of user by the right amount for given token', async () => {
            const balance = await userMetaERC20WrapperContract.functions.balanceOf(userAddress, tokenAddress)
            expect(balance).to.be.eql(depositAmount.sub(withdrawAmount))
          })

        })

      })


    })
  })
})
