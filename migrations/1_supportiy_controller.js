const SupportiyController = artifacts.require('controller/SupportiyController')
const DepositProof = artifacts.require('proof/DepositProof')
const GovToken = artifacts.require('token/GovToken')

const DAI_ADDRESS_RINKEBY = process.env.DAI_ADDRESS_RINKEBY;
const CDAI_ADDRESS_RINKEBY = process.env.CDAI_ADDRESS_RINKEBY;
const DAI_ADDRESS = process.env.DAI_ADDRESS;
const CDAI_ADDRESS = process.env.CDAI_ADDRESS;

module.exports = async function (deployer) {
  const isRinkeby = deployer.network.includes('rinkeby')

  // please change nameDP
  const nameDP = 'supportiy deposit proof'
  // please change symbolDP
  const symbolDP = 'SUPDP'

  const daiAddress = isRinkeby
    ? DAI_ADDRESS_RINKEBY
    : DAI_ADDRESS;
  const cdaiAddress = isRinkeby
    ? CDAI_ADDRESS_RINKEBY
    : CDAI_ADDRESS;

  await deployer.deploy(DepositProof, nameDP, symbolDP, daiAddress, cdaiAddress)

  // please change nameGOV
  const nameGOV = 'supportiy governance token'
  // please change symbolGOV
  const symbolGOV = 'SUP'

  await deployer.deploy(GovToken, nameGOV, symbolGOV)

  await deployer.deploy(
    SupportiyController,
    DepositProof.address,
    GovToken.address
  )
}
