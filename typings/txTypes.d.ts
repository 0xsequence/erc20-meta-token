import { Wallet } from 'ethers'
import { BigNumber } from 'ethers/utils'

export type GasReceipt = {
  gasLimit: number | string | BigNumber;
  baseGas: number | string | BigNumber;
  gasPrice: number | string | BigNumber;
  feeToken: number | string | BigNumber;
  feeRecipient: string;
};

export type TransferSignature = {
  contractAddress: string;
  signerWallet: Wallet;
  receiver: string;
  id: number | string | BigNumber;
  amount: number | string | BigNumber;
  transferData: Uint8Array | null;
  nonce: number | string | BigNumber;
}