const SupportiyController = artifacts.require('controller/SupportiyController')
const DepositProof = artifacts.require('proof/DepositProof')
const GovToken = artifacts.require('token/GovToken')

module.exports = async function (deployer) {
  const isRinkeby = deployer.network.includes('rinkeby')

  // please change nameDP
  const nameDP = 'supportiy deposit proof'
  // please change symbolDP
  const symbolDP = 'SUPDP'

  const daiAddress = isRinkeby
    ? '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea'
    : '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const cdaiAddress = isRinkeby
    ? '0x6d7f0754ffeb405d23c51ce938289d4835be3b14'
    : '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643';

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
