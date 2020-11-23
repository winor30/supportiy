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
const DEPOSIT_PROOF_ADDRESS = process.env.DEPOSIT_PROOF_ADDRESS;
const INFURA_KEY = process.env.INFURA_KEY;
const NETWORK = process.env.NETWORK;
const INFURA_URL = NETWORK === 'rinkeby' ? `https://rinkeby.infura.io/v3/${INFURA_KEY}` : `https://mainnet.infura.io/v3/${INFURA_KEY}`;

async function main() {
  requireNonNull(PRIVATE_KEY, DEPOSIT_PROOF_ADDRESS, INFURA_KEY, NETWORK)
  const abi = getABI('DepositProof');

  const wallet = Wallet.fromPrivateKey(ethUtil.toBuffer(`0x${PRIVATE_KEY}`));
  const address = wallet.getAddressString();
  const provider = new HDWalletProvider({ privateKeys: [PRIVATE_KEY], providerOrUrl: INFURA_URL });
  const web3Instance = new web3(provider)

  const dp = new web3Instance.eth.Contract(
    abi,
    DEPOSIT_PROOF_ADDRESS,
    { gas: 5000000, gasPrice: '4000000000' }
  )
  const balance = await  dp.methods.balanceOf(address).call({from: address});
  console.log(`${address}'s balance: `, balance);

  const tokenIds = await Promise.all(Object.keys([...new Array(balance)])
    .map(p => Number(p))
    .map(async i => {
      const tokenId = await dp.methods.tokenOfOwnerByIndex(address, i).call({from: address});
      const tokenAmount = await dp.methods.tokenAmount(tokenId).call({from: address});
      const ctokenAmount = await dp.methods.ctokenAmount(tokenId).call({from: address});
      return {tokenId, tokenAmount, ctokenAmount}
    }))
  console.log(tokenIds);
}

main().then(() => {
  console.log('success')
  process.exit(0)
}).catch(e => {
  console.error('failed', e)
  process.exit(1)
})
