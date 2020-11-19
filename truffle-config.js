// add dotenv
require('dotenv').config()

const HDWalletProvider = require('@truffle/hdwallet-provider')
const infuraKey = process.env.INFURA_KEY

// add privateKey for deploy account
const privateKey = process.env.PRIVATE_KEY

module.exports = {
  networks: {
    mainnet: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [privateKey],
          providerOrUrl: `https://mainnet.infura.io/v3/${infuraKey}`
        }),
      network_id: 1,
      gas: 4612388 // Gas limit used for deploys
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [privateKey],
          providerOrUrl: `https://rinkeby.infura.io/v3/${infuraKey}`
        }),
      network_id: 4,
      gas: 4612388, // Gas limit used for deploys
      gasPrice: 200000000000
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.7.4', // Fetch exact version from solc-bin (default: truffle's version)
      settings: {
        evmVersion: 'constantinople',
        optimizer: {
          enabled: true,
          runs: 1000000,
          details: {
            yul: true,
            deduplicate: true,
            cse: true,
            constantOptimizer: true
          }
        }
      }
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  }
}
