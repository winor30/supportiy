type ContractName = 'SupportiyController' | 'DepositProof' | 'GovToken';
export const getABI = (contract: ContractName) => {
  const abi = require(`../../build/contracts/${contract}.json`).abi
  if (!abi) {
    throw new Error('abi is empty')
  }
  return abi;
}
