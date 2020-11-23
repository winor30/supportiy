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
const DEPOSIT_PROOF_ADDRESS = process.env.DEPOSIT_PROOF_ADDRESS
const SUPPORTIY_CONTROLLER = process.env.SUPPORTIY_CONTROLLER;
const INFURA_KEY = process.env.INFURA_KEY;
const NETWORK = process.env.NETWORK;
const INFURA_URL = NETWORK === 'rinkeby' ? `https://rinkeby.infura.io/v3/${INFURA_KEY}` : `https://mainnet.infura.io/v3/${INFURA_KEY}`;



async function main() {
  requireNonNull(PRIVATE_KEY, DEPOSIT_PROOF_ADDRESS, SUPPORTIY_CONTROLLER, INFURA_KEY, NETWORK)
  const abi = getABI('DepositProof');

  const wallet = Wallet.fromPrivateKey(ethUtil.toBuffer(`0x${PRIVATE_KEY}`));
  const address = wallet.getAddressString();
  const provider = new HDWalletProvider({ privateKeys: [PRIVATE_KEY], providerOrUrl: INFURA_URL });
  const web3Instance = new web3(provider)

  const depositProof = new web3Instance.eth.Contract(
    abi,
    DEPOSIT_PROOF_ADDRESS,
    { gas: 2000000, gasPrice: '10000000000' }
  )

  const result = await depositProof.methods.getIssuer().call({ from: address });
  console.log('grantRole result: ', result);
}

main().then(() => {
  console.log('success')
  process.exit(0)
}).catch(e => {
  console.error('failed', e)
  process.exit(1)
})
