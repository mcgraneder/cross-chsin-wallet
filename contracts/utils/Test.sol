// SPDX-License-Identifier: GPL-3.0

// solhint-disable-next-line
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";

contract ABC is ERC20PresetFixedSupply {
    constructor() ERC20PresetFixedSupply("ABC", "ABC", 1e27, msg.sender) {}
}

contract PQR is ERC20PresetFixedSupply {
    constructor() ERC20PresetFixedSupply("PQR", "PQR", 1e27, msg.sender) {}
}

contract XYZ is ERC20PresetFixedSupply {
    constructor() ERC20PresetFixedSupply("XYZ", "XYZ", 1e27, msg.sender) {}
}