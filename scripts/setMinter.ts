import HDWalletProvider from '@truffle/hdwallet-provider';
import { config } from 'dotenv';
import * as ethUtil from 'ethereumjs-util';
import Wallet from 'ethereumjs-wallet';
import web3 from 'web3';
import { getABI } from './lib/abi';
import { requireNonNull } from './lib/requireNonNull';

// load dotenv
config();

const PRIVATE_KEY = process.env.PRIVATE_KEY
const GOV_TOKEN_ADDRESS = process.env.GOV_TOKEN_ADDRESS
const SUPPORTIY_CONTROLLER = process.env.SUPPORTIY_CONTROLLER;
const INFURA_KEY = process.env.INFURA_KEY;
const NETWORK = process.env.NETWORK;
const INFURA_URL = NETWORK === 'rinkeby' ? `https://rinkeby.infura.io/v3/${INFURA_KEY}` : `https://mainnet.infura.io/v3/${INFURA_KEY}`;

async function main() {
  requireNonNull(PRIVATE_KEY, GOV_TOKEN_ADDRESS, SUPPORTIY_CONTROLLER, INFURA_KEY, NETWORK)
  const abi = getABI('GovToken');

  const wallet = Wallet.fromPrivateKey(ethUtil.toBuffer(`0x${PRIVATE_KEY}`));
  const address = wallet.getAddressString();
  const provider = new HDWalletProvider({ privateKeys: [PRIVATE_KEY], providerOrUrl: INFURA_URL });
  const web3Instance = new web3(provider)

  const govToken = new web3Instance.eth.Contract(
    abi,
    GOV_TOKEN_ADDRESS,
    { gas: 5000000, gasPrice: '4000000000' }
  )

  const result = await govToken.methods.grantRole('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', SUPPORTIY_CONTROLLER).send({ from: address });
  console.log('grantRole result: ', result);
}

main().then(() => {
  console.log('success')
  process.exit(0)
}).catch(e => {
  console.error('failed', e)
  process.exit(1)
})
