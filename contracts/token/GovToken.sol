// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

contract GovToken is ERC20PresetMinterPauser {
  constructor(string memory name_, string memory symbol_) ERC20PresetMinterPauser(name_, symbol_) {}

}
