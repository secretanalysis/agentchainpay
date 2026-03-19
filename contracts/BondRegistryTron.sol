// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// Minimal bond registry: stake bonds tied to DID hash, withdraw after lock expiry. Use slashing via governor/treasury in production.

contract BondRegistryTron {
    struct Bond { address staker; uint256 amount; uint256 expiry; }
    mapping(bytes32 => Bond[]) public bonds;
    address public governor;
    event BondStaked(bytes32 didHash, address staker, uint256 amount, uint256 expiry);
    event BondWithdrawn(bytes32 didHash, address staker, uint256 amount);

    constructor(address _gov) {
        governor = _gov;
    }

    function stakeBond(bytes32 didHash) external payable {
        require(msg.value > 0, "zero");
        bonds[didHash].push(Bond({ staker: msg.sender, amount: msg.value, expiry: block.timestamp + 30 days }));
        emit BondStaked(didHash, msg.sender, msg.value, block.timestamp + 30 days);
    }

    function withdrawBond(bytes32 didHash, uint256 index) external {
        Bond storage b = bonds[didHash][index];
        require(b.staker == msg.sender, "not owner");
        require(block.timestamp >= b.expiry, "locked");
        uint256 amt = b.amount;
        b.amount = 0;
        payable(msg.sender).transfer(amt);
        emit BondWithdrawn(didHash, msg.sender, amt);
    }
}
