// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract DepositProof is ERC721, Ownable {
  using SafeMath for uint256;

  address private tokenAddress;
  address private ctokenAddress;
  mapping(uint256 => uint256) public tokenAmounts;
  mapping(uint256 => uint256) public ctokenAmounts;
  address private _issuer;
  address private _owner;
  uint256 private _currentTokenId = 0;

  constructor(string memory name_, string memory symbol_, address _token, address _ctoken) ERC721(name_, symbol_) Ownable() {
    tokenAddress = _token;
    ctokenAddress =_ctoken;
    _owner = msg.sender;
    _issuer = msg.sender;
  }

  modifier existsToken(uint256 tokenId) {
    require(_exists(tokenId), "ERC721: operator query for nonexistent token");
    _;
  }

  modifier onlyTokenOwner(address tokenOwner, uint256 tokenId) {
    require(ownerOf(tokenId) == tokenOwner || _owner == tokenOwner, "DepositProof/only-token-owner");
    _;
  }

  modifier onlyIssuer {
    require(_issuer == msg.sender || _owner == msg.sender, "right minting token has only issuer");
    _;
  }

  function tokenAmount(uint256 tokenId) public view existsToken(tokenId) returns (uint256)  {
    return tokenAmounts[tokenId];
  }

  function ctokenAmount(uint256 tokenId) public view existsToken(tokenId) returns (uint256)  {
    return ctokenAmounts[tokenId];
  }

  // issue proof
  function issue(address to, uint256 token, uint256 ctoken) public onlyIssuer returns(bool) {
    // mint next token
    uint256 nextTokenId = _getNextTokenId();
    _mint(to, nextTokenId);

    // record deposited token and mint ctoken amount to nft
    tokenAmounts[nextTokenId] = token;
    ctokenAmounts[nextTokenId] = ctoken;

    _incrementTokenId();
    return true;
  }

  function incrementToken(address tokenOwner, uint256 tokenId, uint256 token, uint256 ctoken) public onlyIssuer onlyTokenOwner(tokenOwner, tokenId) existsToken(tokenId) returns(bool) {
    uint256 currentToken = tokenAmounts[tokenId];
    uint256 currentCToken = ctokenAmounts[tokenId];
    tokenAmounts[tokenId] = currentToken.add(token);
    ctokenAmounts[tokenId] = currentCToken.add(ctoken);
    return true;
  }

  // burn proof
  function burn(uint256 tokenId) public onlyIssuer returns (bool) {
    _burn(tokenId);

    // record deposited token and mint ctoken amount to nft
    delete tokenAmounts[tokenId];
    delete ctokenAmounts[tokenId];

    return true;
  }

  function setIssuer(address issuer) public onlyIssuer {
    require(msg.sender == issuer, "only issuer has right to change mint right");
    _issuer = issuer;
  }


  function getIssuer() public view returns (address) {
    return _issuer;
  }

  function _incrementTokenId() private {
      _currentTokenId++;
  }

  function _getNextTokenId() private view returns (uint256) {
      return _currentTokenId.add(1);
  }

  function getTokenAddress() public view returns (address) {
    return tokenAddress;
  }

  function getCTokenAddress() public view returns (address) {
    return ctokenAddress;
  }
}
