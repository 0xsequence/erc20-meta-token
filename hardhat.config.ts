import { HardhatUserConfig } from 'hardhat/config'

import '@nomiclabs/hardhat-truffle5'
import '@nomiclabs/hardhat-ethers'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import '@tenderly/hardhat-tenderly'

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: {
        enabled: true,
        runs: 100000,
        details: {
          yul: true,
          constantOptimizer: false
        }
      }
    }
  },
  paths: {
    root: 'src',
    tests: '../tests'
  },
  networks: {
    ganache: {
      url: 'http://127.0.0.1:8545',
      blockGasLimit: 10000000
    },
    matic: {
      url: 'https://rpc-mainnet.matic.network'
    },
    coverage: {
      url: 'http://localhost:8555'
    }
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS === true,
    currency: 'USD',
    gasPrice: 21,
    showTimeSpent: true
  }
}

export default config
