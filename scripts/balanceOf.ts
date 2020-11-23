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
const SUPPORTIY_CONTROLLER = process.env.SUPPORTIY_CONTROLLER;
const INFURA_KEY = process.env.INFURA_KEY;
const NETWORK = process.env.NETWORK;
const INFURA_URL = NETWORK === 'rinkeby' ? `https://rinkeby.infura.io/v3/${INFURA_KEY}` : `https://mainnet.infura.io/v3/${INFURA_KEY}`;
const CDAI_ADDRESS = NETWORK === 'rinkeby' ? process.env.CDAI_ADDRESS_RINKEBY : process.env.CDAI_ADDRESS;

async function main() {
  requireNonNull(PRIVATE_KEY, CDAI_ADDRESS, SUPPORTIY_CONTROLLER, INFURA_KEY, NETWORK)
  const abi = getABI('GovToken');

  const wallet = Wallet.fromPrivateKey(ethUtil.toBuffer(`0x${PRIVATE_KEY}`));
  const address = wallet.getAddressString();
  const provider = new HDWalletProvider({ privateKeys: [PRIVATE_KEY], providerOrUrl: INFURA_URL });
  const web3Instance = new web3(provider)

  const cdai = new web3Instance.eth.Contract(
    abi,
    CDAI_ADDRESS,
    { gas: 5000000, gasPrice: '4000000000' }
  )
  const target = SUPPORTIY_CONTROLLER;
  const balance = await cdai.methods.balanceOf(target).call({ from: address });
  console.log(`${target}'s balance: `, balance);
}

main().then(() => {
  console.log('success')
  process.exit(0)
}).catch(e => {
  console.error('failed', e)
  process.exit(1)
})
