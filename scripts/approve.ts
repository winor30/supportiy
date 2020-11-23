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
const DAI_ADDRESS = NETWORK === 'rinkeby' ? process.env.DAI_ADDRESS_RINKEBY : process.env.DAI_ADDRESS;

async function main() {
  requireNonNull(PRIVATE_KEY, DAI_ADDRESS, SUPPORTIY_CONTROLLER, INFURA_KEY, NETWORK)
  const abi = getABI('DepositProof');

  const wallet = Wallet.fromPrivateKey(ethUtil.toBuffer(`0x${PRIVATE_KEY}`));
  const address = wallet.getAddressString();
  const provider = new HDWalletProvider({ privateKeys: [PRIVATE_KEY], providerOrUrl: INFURA_URL });
  const web3Instance = new web3(provider)

  const dai = new web3Instance.eth.Contract(
    abi,
    DAI_ADDRESS,
    { gas: 5000000, gasPrice: '4000000000' }
  )
  const balance = await dai.methods.balanceOf(address).call({ from: address });
  console.log(`${address}'s balance: `, balance);
  const result = await dai.methods.approve(SUPPORTIY_CONTROLLER, `${balance}`).send({ from: address });
  console.log('grantRole result: ', result, balance);
}

main().then(() => {
  console.log('success')
  process.exit(0)
}).catch(e => {
  console.error('failed', e)
  process.exit(1)
})
