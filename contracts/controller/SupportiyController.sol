// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.8.0;

import "../proof/DepositProof.sol";
import "../token/CTokenInterface.sol";
import "../token/GovToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract SupportiyController is Ownable {
  using SafeMath for uint256;
  // deposit token to earn token by Compound.
  // earned token support owner.
  DepositProof private proof;
  IERC20 private token;
  CTokenInterface private ctoken;
  GovToken private govtoken;

  uint256 totalDeposited;

  constructor(address proofAddress, address govaddress) Ownable() {
    proof = DepositProof(proofAddress);
    address tokenAddress = proof.getTokenAddress();
    address ctokenAddress = proof.getCTokenAddress();

    token = IERC20(tokenAddress);
    ctoken = CTokenInterface(ctokenAddress);

    govtoken = GovToken(govaddress);
  }

  function _deposit(uint256 amount) private returns (uint256) {
    // token: SupportiyController <- sender
    bool isTransferred = token.transferFrom(msg.sender, address(this), amount);
    require(isTransferred, "SupportiyController/failed-to-transfer-token-in-depositByTokenId");

    // mint ctoken by transferred token
    uint256 previousCTokenAmount = ctoken.balanceOf(address(this));
    token.approve(address(ctoken), amount);
    uint err = ctoken.mint(amount);
    require(err == 0, "SupportiyController/failed-ctoken-mint-in-deposit");
    uint256 currentCTokenAmount = ctoken.balanceOf(address(this));

    // calculated minted ctoken
    uint256 mintedCToken = currentCTokenAmount.sub(previousCTokenAmount);
    require(mintedCToken > 0, "SupportiyController/failed-minted-ctoken-less-than-zero");
    return mintedCToken;
  }

  // deposit token to support by compound's interest at first time
  function deposit(uint256 amount) public returns (bool) {
    // mint ctoken by transferred token
    uint256 mintedCToken = _deposit(amount);

    // mint deposit proof to sender
    bool isMinted = proof.issue(msg.sender, amount, mintedCToken);
    require(isMinted, "SupportiyController/failed-to-mint-DepositProof");

    return true;
  }

  // deposit token to support by compound's interest when you already have a depositProof
  function depositByTokenId(uint256 tokenId, uint256 amount) public returns (bool) {
    // mint ctoken by transferred token
    uint256 mintedCToken = _deposit(amount);

    // update proof to add token and ctoken
    bool isIncremented = proof.incrementToken(msg.sender, tokenId, amount, mintedCToken);
    require(isIncremented, "SupportiyController/failed-increment-token");

    return true;
  }

  // Withdraw the token that the user has deposited
  // Also, the interest token is sent to the owner at the time of withdrawal
  function withdraw(uint256 tokenId) public returns (bool) {
    // check token owner
    require(proof.ownerOf(tokenId) == msg.sender, "DepositProof/only-token-owner");

    // get data: tokenAmount and ctokenAmount
    uint256 depositedToken = proof.tokenAmount(tokenId);
    require(depositedToken >= 0, "SupportiyController/deposited-token-less-than-zero");
    uint256 depositedCToken = proof.ctokenAmount(tokenId);
    require(depositedCToken >= 0, "SupportiyController/deposited-ctoken-less-than-zero");

    // redeem ctoken in order to receive token.
    uint256 previousTokenAmount = token.balanceOf(address(this));
    uint256 err = ctoken.redeem(depositedCToken);
    require(err == 0, "SupportiyController/failed-redeemed");

    uint256 currentTokenAmount = token.balanceOf(address(this));
    uint256 redeemedToken = currentTokenAmount.sub(previousTokenAmount);
    require(redeemedToken > 0, "SupportiyController/redeemed-less-than-zero");

    // calculate gov token from token amount trasferred to owner (redeemedToken - depositedToken)
    uint256 diffToken = redeemedToken.sub(depositedToken);
    if (diffToken > 0) {
      // mint gov token to sender
      govtoken.mint(msg.sender, diffToken);

      // transfer diffToken to owner (it is interest)
      bool isTransferredToOwner = token.transfer(owner(), diffToken);
      require(isTransferredToOwner, "SupportiyController/failed-transfer-token-to-owner");
    }

    // transfer token to sender
    bool isTransferred = token.transfer(msg.sender, depositedToken);
    require(isTransferred, "SupportiyController/failed-transfer-token-to-supporter");

    // finally deposit proof is burned because the withdrawal is over
    bool isBurn = proof.burn(tokenId);
    require(isBurn, "SupportiyController/failed-burn-deposit-proof-in-supporter");
    return true;
  }
}
