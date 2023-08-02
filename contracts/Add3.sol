// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Add3 is ERC20, ERC20Burnable, Pausable, Ownable {
    constructor() ERC20("Add3", "ADD") {}

    // pause function called by owner
    function pause() public onlyOwner {
        _pause();
    }

    // unpause function called by owner
    function unpause() public onlyOwner {
        _unpause();
    }

    // mint function called by owner
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    // burn override function called by owner
    function burn(uint256 amount) public override {
        require(msg.sender == owner(), "Only owner can burn tokens");
        _burn(msg.sender, amount);
    }
}
