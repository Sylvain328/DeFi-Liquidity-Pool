// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HWT is ERC20 {
    constructor() ERC20("Hello World Token", "HWT") {
        _mint(msg.sender, 1000000000000000000000000000);
    }
}