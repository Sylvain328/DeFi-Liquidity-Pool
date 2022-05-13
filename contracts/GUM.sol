// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GUM is ERC20 {
    constructor() ERC20("Gum Token", "GUM") {
        _mint(msg.sender, 100 * 1e18);
    }
}