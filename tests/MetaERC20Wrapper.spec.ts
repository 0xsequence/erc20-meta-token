import { AbstractContract, RevertError, expect, RevertUnsafeMathError } from './utils'
import * as utils from './utils'

import { MetaERC20Wrapper, ERC20Mock } from 'src/gen/typechain'

import { BigNumber } from 'ethers'

// init test wallets from package.json mnemonic
import { ethers, web3 } from 'hardhat'

const { wallet: ownerWallet, provider: ownerProvider, signer: ownerSigner } = utils.createTestWallet(web3, 0)

const { wallet: receiverWallet, provider: receiverProvider, signer: receiverSigner } = utils.createTestWallet(web3, 2)

const { wallet: userWallet, provider: userProvider, signer: userSigner } = utils.createTestWallet(web3, 3)

const { wallet: operatorWallet, provider: operatorProvider, signer: operatorSigner } = utils.createTestWallet(web3, 4)

describe('MetaErc20Wrapper', () => {
  // Initial token balance
  const INIT_BALANCE = 100

  // 4m gas limit when gas estimation is incorrect (internal txs)
  const txParam = { gasLimit: 4000000 }

  // Addresses
  const ZERO_ADDRESS: string = '0x0000000000000000000000000000000000000000' // Zero address
  const ETH_ADDRESS: string = '0x0000000000000000000000000000000000000001' // One address
  let receiverAddress: string // Address of receiver
  let userAddress: string // Address of user
  let tokenAddress: string // Address of ERC20 token contract
  let tokenID: BigNumber // BigNumber representation of ERC-20 token address
  let wrapperAddress: string // Address of wrapper contract
  let ONE_ID = BigNumber.from(1)

  // Contracts
  let ownerMetaErc20WrapperContract: MetaERC20Wrapper
  let userMetaErc20WrapperContract: MetaERC20Wrapper
  let userERC20Contract: ERC20Mock

  // Provider
  const { provider } = ethers

  context('When MetaERC20Wrapper contract is deployed', () => {
    before(async () => {
      receiverAddress = await receiverWallet.getAddress()
      userAddress = await userWallet.getAddress()
    })

    beforeEach(async () => {
      // Deploy MetaERC20Wrapper
      let abstractMetaErc20Wrapper = await AbstractContract.fromArtifactName('MetaERC20Wrapper')
      ownerMetaErc20WrapperContract = (await abstractMetaErc20Wrapper.deploy(ownerWallet)) as MetaERC20Wrapper
      userMetaErc20WrapperContract = (await ownerMetaErc20WrapperContract.connect(userSigner)) as MetaERC20Wrapper

      // Deploy ERC20
      let abstractErc20Mock = await AbstractContract.fromArtifactName('ERC20Mock')
      userERC20Contract = (await abstractErc20Mock.deploy(userWallet)) as ERC20Mock

      // Mint tokens to user
      await userERC20Contract.functions.mockMint(userAddress, INIT_BALANCE)
      tokenAddress = userERC20Contract.address
      tokenID = BigNumber.from(2)

      wrapperAddress = ownerMetaErc20WrapperContract.address
    })

    describe('getter functions', () => {
      describe('supportsInterface()', () => {
        it('should return true for 0x01ffc9a7 (IERC165)', async () => {
          const support = await ownerMetaErc20WrapperContract.functions.supportsInterface('0x01ffc9a7')
          expect(support[0]).to.be.eql(true)
        })

        it('should return true for 0x4e2312e0 (IERC1155Receiver)', async () => {
          const support = await ownerMetaErc20WrapperContract.functions.supportsInterface('0x4e2312e0')
          expect(support[0]).to.be.eql(true)
        })

        it('should return true for 0xd9b67a26 (IERC1155)', async () => {
          const support = await ownerMetaErc20WrapperContract.functions.supportsInterface('0xd9b67a26')
          expect(support[0]).to.be.eql(true)
        })
      })
    })

    describe('deposit() function', () => {
      const depositAmount = BigNumber.from(20)

      describe('when depositing tokens', () => {
        it('should REVERT if user did not approve wrapper contract', async () => {
          const tx = userMetaErc20WrapperContract.functions.deposit(tokenAddress, userAddress, depositAmount, txParam)
          await expect(tx).to.be.rejected
        })

        it('should REVERT if approval for wrapper contract is not sufficient', async () => {
          await userERC20Contract.functions.approve(wrapperAddress, depositAmount.sub(1))

          const tx = userMetaErc20WrapperContract.functions.deposit(tokenAddress, userAddress, depositAmount, txParam)
          await expect(tx).to.be.rejected
        })

        context('When token contract is approved', () => {
          beforeEach(async () => {
            await userERC20Contract.functions.approve(wrapperAddress, INIT_BALANCE)
          })

          it('should REVERT if user does not have sufficient funds', async () => {
            const tx = userMetaErc20WrapperContract.functions.deposit(tokenAddress, userAddress, INIT_BALANCE + 1, txParam)
            await expect(tx).to.be.rejected
          })

          it('should REVERT if msg.value is not 0', async () => {
            const tx = userMetaErc20WrapperContract.functions.deposit(tokenAddress, userAddress, depositAmount, {
              gasLimit: 1000000,
              value: 1
            })
            await expect(tx).to.be.rejectedWith(RevertError('MetaERC20Wrapper#deposit: NON_NULL_MSG_VALUE'))
          })

          it('should REVERT if recipient is 0x0', async () => {
            const tx = userMetaErc20WrapperContract.functions.deposit(tokenAddress, ZERO_ADDRESS, depositAmount, txParam)
            await expect(tx).to.be.rejectedWith(RevertError('MetaERC20Wrapper#deposit: INVALID_RECIPIENT'))
          })

          it('should PASS if user has sufficient funds', async () => {
            const tx = userMetaErc20WrapperContract.functions.deposit(tokenAddress, userAddress, depositAmount, txParam)
            await expect(tx).to.be.fulfilled
          })

          it('should PASS if recipient is different from sender', async () => {
            const tx = userMetaErc20WrapperContract.functions.deposit(tokenAddress, receiverAddress, depositAmount, txParam)
            await expect(tx).to.be.fulfilled
          })

          context('When tokens are deposited', () => {
            let tx
            beforeEach(async () => {
              tx = await userMetaErc20WrapperContract.functions.deposit(tokenAddress, userAddress, depositAmount, txParam)
            })

            it('should increase nTokens value by 1', async () => {
              const nTokens = await userMetaErc20WrapperContract.functions.getNTokens()
              expect(nTokens[0]).to.be.eql(BigNumber.from(2))
            })

            it('should set id of token to 2', async () => {
              const id = await userMetaErc20WrapperContract.functions.getTokenID(tokenAddress)
              expect(id[0]).to.be.eql(BigNumber.from(2))
            })

            it('should decrease ERC20 balance of user by the right amount', async () => {
              const balance = await userERC20Contract.functions.balanceOf(userAddress)
              expect(balance[0]).to.be.eql(BigNumber.from(INIT_BALANCE).sub(depositAmount))
            })

            it('should decrease ERC20 balance of user by the right amount', async () => {
              const balance = await userERC20Contract.functions.balanceOf(userAddress)
              expect(balance[0]).to.be.eql(BigNumber.from(INIT_BALANCE).sub(depositAmount))
            })

            it('should increase ERC20 balance of wrapper contract by the right amount', async () => {
              const balance = await userERC20Contract.functions.balanceOf(wrapperAddress)
              expect(balance[0]).to.be.eql(depositAmount)
            })

            it('should increase ERC1155 balance of user by the right amount for given token', async () => {
              const balance_1 = await userMetaErc20WrapperContract.functions.balanceOf(userAddress, 2)
              expect(balance_1[0]).to.be.eql(depositAmount)

              await userMetaErc20WrapperContract.functions.deposit(tokenAddress, receiverAddress, depositAmount, txParam)

              const balance_2 = await userMetaErc20WrapperContract.functions.balanceOf(receiverAddress, 2)
              expect(balance_2[0]).to.be.eql(depositAmount)
            })

            it('should emit a TokenRegistration events for new token', async () => {
              const receipt = await tx.wait(1)
              const ev = receipt.events[2]
              expect(ev.event).to.be.eql('TokenRegistration')
            })

            it('should have token address as `token_address` field in TokenRegistration event', async () => {
              const receipt = await tx.wait(1)
              const ev = receipt.events[2]
              const args = ev.args! as any
              expect(args.token_address).to.be.eql(tokenAddress)
            })

            it('should have 2 as `token_id` field in TokenRegistration event', async () => {
              const receipt = await tx.wait(1)
              const ev = receipt.events[2]
              const args = ev.args! as any
              expect(args.token_id).to.be.eql(BigNumber.from(2))
            })

            it('should NOT emit a TokenRegistration events for already registered token', async () => {
              let tx2 = await userMetaErc20WrapperContract.functions.deposit(tokenAddress, userAddress, depositAmount, txParam)
              const receipt = await tx2.wait(1)
              const events = receipt.events!

              for (let i = 0; i < events.length; i++) {
                expect(events[i].event).to.be.not.eql('TokenRegistration')
              }
            })
          })
        })
      })

      describe('when depositing ETH', () => {
        it('should REVERT if msg.value is not equal to value', async () => {
          //msg.value is smaller than value
          let tx = userMetaErc20WrapperContract.functions.deposit(ETH_ADDRESS, userAddress, depositAmount, {
            gasLimit: 1000000,
            value: depositAmount.sub(1)
          })
          await expect(tx).to.be.rejectedWith(RevertError('MetaERC20Wrapper#deposit: INCORRECT_MSG_VALUE'))

          // Msg.value is larger than value
          tx = userMetaErc20WrapperContract.functions.deposit(ETH_ADDRESS, userAddress, depositAmount, {
            gasLimit: 1000000,
            value: depositAmount.add(1)
          })
          await expect(tx).to.be.rejectedWith(RevertError('MetaERC20Wrapper#deposit: INCORRECT_MSG_VALUE'))
        })

        it('should REVERT if recipient is 0x0', async () => {
          const tx = userMetaErc20WrapperContract.functions.deposit(ETH_ADDRESS, ZERO_ADDRESS, depositAmount, {
            gasLimit: 1000000,
            value: depositAmount
          })
          await expect(tx).to.be.rejectedWith(RevertError('MetaERC20Wrapper#deposit: INVALID_RECIPIENT'))
        })

        it('should PASS if msg.value is equal to value', async () => {
          //msg.value is smaller than value
          let tx = userMetaErc20WrapperContract.functions.deposit(ETH_ADDRESS, userAddress, depositAmount, {
            gasLimit: 1000000,
            value: depositAmount
          })
          await expect(tx).to.be.fulfilled
        })

        it('should PASS if recipient is different from sender', async () => {
          //msg.value is smaller than value
          let tx = userMetaErc20WrapperContract.functions.deposit(ETH_ADDRESS, receiverAddress, depositAmount, {
            gasLimit: 1000000,
            value: depositAmount
          })
          await expect(tx).to.be.fulfilled
        })

        context('When ETH were deposited', () => {
          let tx
          beforeEach(async () => {
            tx = await userMetaErc20WrapperContract.functions.deposit(ETH_ADDRESS, userAddress, depositAmount, {
              gasLimit: 1000000,
              value: depositAmount
            })
          })

          it('should increase ETH balance of wrapper contract by the right amount', async () => {
            const balance = await provider.getBalance(wrapperAddress)
            expect(balance).to.be.eql(depositAmount)
          })

          it('should increase ERC1155 balance of user by the right amount for given token', async () => {
            const balance_1 = await userMetaErc20WrapperContract.functions.balanceOf(userAddress, ETH_ADDRESS)
            expect(balance_1[0]).to.be.eql(depositAmount)

            await userMetaErc20WrapperContract.functions.deposit(ETH_ADDRESS, receiverAddress, depositAmount, {
              gasLimit: 1000000,
              value: depositAmount
            })

            const balance_2 = await userMetaErc20WrapperContract.functions.balanceOf(receiverAddress, ETH_ADDRESS)
            expect(balance_2[0]).to.be.eql(depositAmount)
          })

          it('should NOT emit a TokenRegistration event', async () => {
            const receipt = await tx.wait(1)
            const events = receipt.events!

            for (let i = 0; i < events.length; i++) {
              expect(events[i].event).to.be.not.eql('TokenRegistration')
            }
          })
        })
      })
    })

    describe('fallback function', () => {
      const depositAmount = BigNumber.from(10)
      let txData: any

      it('should PASS if msg.value is equal to value', async () => {
        txData = { to: wrapperAddress, gasLimit: 1000000, value: depositAmount }

        let tx = userWallet.sendTransaction(txData)
        await expect(tx).to.be.fulfilled
      })

      context('When ETH were deposited', () => {
        beforeEach(async () => {
          txData = { to: wrapperAddress, gasLimit: 1000000, value: depositAmount }

          // Deposit via fallback
          await userWallet.sendTransaction(txData)
        })

        it('should increase ETH balance of wrapper contract by the right amount', async () => {
          const balance = await provider.getBalance(wrapperAddress)
          expect(balance.toNumber()).to.be.equal(depositAmount.toNumber())
        })

        it('should increase ERC1155 balance of user by the right amount for given token', async () => {
          const balance = await userMetaErc20WrapperContract.functions.balanceOf(userAddress, ETH_ADDRESS)
          expect(balance[0]).to.be.eql(depositAmount)
        })
      })
    })

    describe('withdraw function', () => {
      const depositAmount = BigNumber.from(66)
      const withdrawAmount = depositAmount

      describe('when withdrawing tokens', () => {
        beforeEach(async () => {
          await userERC20Contract.functions.approve(wrapperAddress, INIT_BALANCE) // Approve tokens
          await userMetaErc20WrapperContract.functions.deposit(tokenAddress, userAddress, depositAmount) // Deposit tokens
        })

        it('should REVERT if user does not have sufficient wrapped tokens', async () => {
          const tx = userMetaErc20WrapperContract.functions.withdraw(tokenAddress, userAddress, depositAmount.add(1), txParam)
          await expect(tx).to.be.rejectedWith(RevertUnsafeMathError())
        })

        it('should REVERT if token is not registered', async () => {
          const tx = userMetaErc20WrapperContract.functions.withdraw(userAddress, userAddress, depositAmount, txParam)
          await expect(tx).to.be.rejectedWith(RevertError('MetaERC20Wrapper#getTokenID: UNREGISTERED_TOKEN'))
        })

        it('should REVERT if recipient is 0x0', async () => {
          const tx = userMetaErc20WrapperContract.functions.withdraw(tokenAddress, ZERO_ADDRESS, depositAmount, txParam)
          await expect(tx).to.be.rejected
        })

        it('should PASS if user has sufficient wrapped tokens', async () => {
          const tx = userMetaErc20WrapperContract.functions.withdraw(tokenAddress, userAddress, depositAmount, txParam)
          await expect(tx).to.be.fulfilled
        })

        it('should PASS when withdrawing to another address', async () => {
          const tx = userMetaErc20WrapperContract.functions.withdraw(tokenAddress, receiverAddress, depositAmount, txParam)
          await expect(tx).to.be.fulfilled
        })

        context('When tokens are withdrawn', () => {
          beforeEach(async () => {
            await userMetaErc20WrapperContract.functions.withdraw(tokenAddress, userAddress, depositAmount, txParam)
          })

          it('should decrease ERC20 balance of wrapper contract by the right amount', async () => {
            const balance = await userERC20Contract.functions.balanceOf(wrapperAddress)
            expect(balance[0]).to.be.eql(depositAmount.sub(withdrawAmount))
          })

          it('should increase ERC20 balance of user by the right amount', async () => {
            const balance = await userERC20Contract.functions.balanceOf(userAddress)
            expect(balance[0]).to.be.eql(
              BigNumber.from(INIT_BALANCE)
                .sub(depositAmount)
                .add(withdrawAmount)
            )
          })

          it('should decrease ERC1155 balance of user by the right amount for given token', async () => {
            const balance = await userMetaErc20WrapperContract.functions.balanceOf(userAddress, tokenAddress)
            expect(balance[0]).to.be.eql(depositAmount.sub(withdrawAmount))
          })
        })
      })

      describe('when withdrawing ETH', () => {
        const depositAmount = BigNumber.from(17)
        const withdrawAmount = depositAmount

        beforeEach(async () => {
          // Depositing ETH
          await userMetaErc20WrapperContract.functions.deposit(ETH_ADDRESS, userAddress, depositAmount, {
            gasLimit: 1000000,
            value: depositAmount
          })
        })

        it('should REVERT if user does not have sufficient wrapped tokens', async () => {
          const tx = userMetaErc20WrapperContract.functions.withdraw(ETH_ADDRESS, userAddress, depositAmount.add(1), txParam)
          await expect(tx).to.be.rejectedWith(RevertUnsafeMathError())
        })

        it('should REVERT if recipient is 0x0', async () => {
          const tx = userMetaErc20WrapperContract.functions.withdraw(ETH_ADDRESS, ZERO_ADDRESS, depositAmount, txParam)
          await expect(tx).to.be.rejectedWith(RevertError('MetaERC20Wrapper#withdraw: INVALID_RECIPIENT'))
        })

        it('should PASS if user has sufficient wrapped tokens', async () => {
          const tx = userMetaErc20WrapperContract.functions.withdraw(ETH_ADDRESS, userAddress, depositAmount, txParam)
          await expect(tx).to.be.fulfilled
        })

        it('should PASS when withdrawing to another address', async () => {
          const tx = userMetaErc20WrapperContract.functions.withdraw(ETH_ADDRESS, receiverAddress, depositAmount, txParam)
          await expect(tx).to.be.fulfilled
        })

        context('When ETH are withdrawn', () => {
          let receiverPreBalance: BigNumber

          beforeEach(async () => {
            receiverPreBalance = await provider.getBalance(receiverAddress)
            await userMetaErc20WrapperContract.functions.withdraw(ETH_ADDRESS, receiverAddress, depositAmount, txParam)
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
            const balance = await userMetaErc20WrapperContract.functions.balanceOf(userAddress, tokenAddress)
            expect(balance[0]).to.be.eql(depositAmount.sub(withdrawAmount))
          })
        })
      })
    })

    describe('onERC1155Received function', () => {
      const depositAmount = BigNumber.from(66)
      const withdrawAmount = depositAmount
      const data = ethers.utils.toUtf8Bytes('')
      receiverAddress = userAddress

      describe('when withdrawing tokens', () => {
        beforeEach(async () => {
          await userERC20Contract.functions.approve(wrapperAddress, INIT_BALANCE) // Approve tokens
          await userMetaErc20WrapperContract.functions.deposit(tokenAddress, userAddress, depositAmount) // Deposit tokens
        })

        it('should REVERT if user does not have sufficient wrapped tokens', async () => {
          const tx = userMetaErc20WrapperContract.functions.safeTransferFrom(
            userAddress,
            wrapperAddress,
            tokenID,
            depositAmount.add(1),
            data
          )
          await expect(tx).to.be.rejectedWith(RevertUnsafeMathError())
        })

        it('should REVERT if token is not registered', async () => {
          //@ts-ignore
          const tx = userMetaErc20WrapperContract.functions.safeTransferFrom(userAddress, wrapperAddress, 666, 0, data)
          await expect(tx).to.be.rejectedWith(RevertError('MetaERC20Wrapper#getIdAddress: UNREGISTERED_TOKEN'))
        })

        it('should PASS if user has sufficient wrapped tokens', async () => {
          //@ts-ignore
          const tx = userMetaErc20WrapperContract.functions.safeTransferFrom(
            userAddress,
            wrapperAddress,
            tokenID,
            depositAmount,
            data
          )
          await expect(tx).to.be.fulfilled
        })

        context('When tokens are withdrawn', () => {
          beforeEach(async () => {
            //@ts-ignore
            await userMetaErc20WrapperContract.functions.safeTransferFrom(
              userAddress,
              wrapperAddress,
              tokenID,
              depositAmount,
              data
            )
          })

          it('should decrease ERC20 balance of wrapper contract by the right amount', async () => {
            const balance = await userERC20Contract.functions.balanceOf(wrapperAddress)
            expect(balance[0]).to.be.eql(depositAmount.sub(withdrawAmount))
          })

          it('should increase ERC20 balance of user by the right amount', async () => {
            const balance = await userERC20Contract.functions.balanceOf(userAddress)
            expect(balance[0]).to.be.eql(
              BigNumber.from(INIT_BALANCE)
                .sub(depositAmount)
                .add(withdrawAmount)
            )
          })

          it('should decrease ERC1155 balance of user by the right amount for given token', async () => {
            const balance = await userMetaErc20WrapperContract.functions.balanceOf(userAddress, tokenAddress)
            expect(balance[0]).to.be.eql(depositAmount.sub(withdrawAmount))
          })
        })
      })

      describe('when withdrawing ETH', () => {
        const depositAmount = BigNumber.from(17)
        const withdrawAmount = depositAmount

        beforeEach(async () => {
          // Depositing ETH
          await userMetaErc20WrapperContract.functions.deposit(ETH_ADDRESS, userAddress, depositAmount, {
            gasLimit: 1000000,
            value: depositAmount
          })
        })

        it('should REVERT if user does not have sufficient wrapped tokens', async () => {
          //@ts-ignore
          const tx = userMetaErc20WrapperContract.functions.safeTransferFrom(
            userAddress,
            wrapperAddress,
            ONE_ID,
            depositAmount.add(1),
            data
          )
          await expect(tx).to.be.rejectedWith(RevertUnsafeMathError())
        })

        it('should PASS if user has sufficient wrapped tokens', async () => {
          //@ts-ignore
          const tx = userMetaErc20WrapperContract.functions.safeTransferFrom(
            userAddress,
            wrapperAddress,
            ONE_ID,
            depositAmount,
            data
          )
          await expect(tx).to.be.fulfilled
        })

        context('When ETH are withdrawn', () => {
          let receiverPreBalance: BigNumber

          beforeEach(async () => {
            receiverPreBalance = await provider.getBalance(receiverAddress)
            //@ts-ignore
            await userMetaErc20WrapperContract.functions.safeTransferFrom(
              userAddress,
              wrapperAddress,
              ONE_ID,
              depositAmount,
              data
            )
          })

          it('should decrease ETH balance of wrapper contract by the right amount', async () => {
            const balance = await provider.getBalance(wrapperAddress)
            expect(balance.toNumber()).to.be.eql(depositAmount.sub(withdrawAmount).toNumber())
          })

          it('should decrease ERC1155 balance of user by the right amount for given token', async () => {
            const balance = await userMetaErc20WrapperContract.functions.balanceOf(userAddress, tokenAddress)
            expect(balance[0]).to.be.eql(depositAmount.sub(withdrawAmount))
          })
        })
      })
    })

    describe('onERC1155BatchReceived function', () => {
      const depositAmount = BigNumber.from(66)
      const withdrawAmount = depositAmount
      const data = ethers.utils.toUtf8Bytes('')
      const noTokens = 4
      let depositAmounts: BigNumber[]
      let tokenContracts: ERC20Mock[]
      let tokenIDs: BigNumber[]
      receiverAddress = userAddress

      beforeEach(async () => {
        let abstractErc20Mock = await AbstractContract.fromArtifactName('ERC20Mock')

        depositAmounts = []
        tokenContracts = []
        tokenIDs = []

        for (let i = 0; i < noTokens; i++) {
          const userERC20Contract = (await abstractErc20Mock.deploy(userWallet)) as ERC20Mock
          await userERC20Contract.functions.mockMint(userAddress, INIT_BALANCE)
          tokenIDs.push(BigNumber.from(2 + i))
          tokenContracts.push(userERC20Contract)
          depositAmounts.push(depositAmount)
        }
      })

      describe('when withdrawing tokens', () => {
        beforeEach(async () => {
          for (let i = 0; i < noTokens; i++) {
            await tokenContracts[i].functions.approve(wrapperAddress, INIT_BALANCE) // Approve tokens
            await userMetaErc20WrapperContract.functions.deposit(tokenContracts[i].address, userAddress, depositAmount) // Deposit tokens
          }
        })

        it('should REVERT if user does not have sufficient wrapped tokens', async () => {
          //@ts-ignore
          const tx = userMetaErc20WrapperContract.functions.safeBatchTransferFrom(
            userAddress,
            wrapperAddress,
            tokenIDs,
            depositAmounts.map(val => val.add(1)),
            data
          )
          await expect(tx).to.be.rejectedWith(RevertUnsafeMathError())
        })

        it('should PASS if user has sufficient wrapped tokens', async () => {
          //@ts-ignore
          const tx = userMetaErc20WrapperContract.functions.safeBatchTransferFrom(
            userAddress,
            wrapperAddress,
            tokenIDs,
            depositAmounts,
            data
          )
          await expect(tx).to.be.fulfilled
        })

        context('When tokens are withdrawn', () => {
          beforeEach(async () => {
            //@ts-ignore
            await userMetaErc20WrapperContract.functions.safeBatchTransferFrom(
              userAddress,
              wrapperAddress,
              tokenIDs,
              depositAmounts,
              data
            )
          })

          it('should decrease ERC20 balance of wrapper contract by the right amount', async () => {
            for (let i = 0; i < noTokens; i++) {
              const balance = await tokenContracts[i].functions.balanceOf(wrapperAddress)
              expect(balance[0]).to.be.eql(BigNumber.from(0))
            }
          })

          it('should increase ERC20 balance of user by the right amount', async () => {
            for (let i = 0; i < noTokens; i++) {
              const balance = await tokenContracts[i].functions.balanceOf(userAddress)
              expect(balance[0]).to.be.eql(
                BigNumber.from(INIT_BALANCE)
                  .sub(depositAmount)
                  .add(withdrawAmount)
              )
            }
          })

          it('should decrease ERC1155 balance of user by the right amount for given token', async () => {
            for (let i = 0; i < noTokens; i++) {
              const balance = await userMetaErc20WrapperContract.functions.balanceOf(userAddress, tokenContracts[i].address)
              expect(balance[0]).to.be.eql(depositAmount.sub(withdrawAmount))
            }
          })
        })
      })
    })
  })
})
