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

  function deposit(uint256 amount) public returns (bool) {
    // token transfer SupportiyController from sender
    bool isTransferred = token.transferFrom(msg.sender, address(this), amount);
    require(isTransferred, "failed to transfer token to contract");

    // mint ctoken from transferred token
    uint256 mintedCToken = ctoken.mint(amount);

    // mint nft token to sender
    bool isMinted = proof.issue(msg.sender, amount, mintedCToken);
    require(isMinted, "failed to mint DepositProof");

    return true;
  }

  function depositByTokenId(uint256 tokenId, uint256 amount) public returns (bool) {
    // token transfer SupportiyController from sender
    bool isTransferred = token.transferFrom(msg.sender, address(this), amount);
    require(isTransferred, "failed to transfer token to contract");

    // mint ctoken from transferred token
    uint256 mintedCToken = ctoken.mint(amount);

    // update proof to add token and ctoken
    bool isIncremented = proof.incrementToken(msg.sender, tokenId, amount, mintedCToken);
    require(isIncremented, "SupportiyController/failed-increment-token");

    return true;
  }

  // Withdraw the token that the user has deposited
  // Also, the interest token is sent to the owner at the time of withdrawal
  function withdraw(uint256 tokenId) public returns (bool) {
    require(proof.ownerOf(tokenId) == msg.sender, "DepositProof/only-token-owner");
    // get data, tokenAmount and ctokenAmount
    uint256 depositedToken = proof.tokenAmount(tokenId);
    require(depositedToken >= 0, "SupportiyController/deposited-token-less-than-zero");
    uint256 depositedCToken = proof.ctokenAmount(tokenId);
    require(depositedCToken >= 0, "SupportiyController/deposited-ctoken-less-than-zero");

    // redeem ctoken in order to receive token.
    uint256 redeemedToken = ctoken.redeem(depositedCToken);
    require(redeemedToken >= depositedToken, "SupportiyController/redeemed-less-than-deposited");

    // calculate gov token from token amount trasferred to owner (redeemedToken - depositedToken)
    uint256 diffToken = redeemedToken - depositedToken;
    if (diffToken != 0) {
      // mint gov token to sender
      govtoken.mint(msg.sender, diffToken);

      // transfer diffToken to owner (it is interest)
      bool isTransferredToOwner = token.transfer(owner(), diffToken);
      require(isTransferredToOwner, "SupportiyController/failed-transfer-token-to-owner");
    }

    // transfer token to sender
    bool isTransferred = token.transfer(msg.sender, depositedToken);
    require(isTransferred, "SupportiyController/failed-transfer-token-to-supporter");
    return true;
  }
}
