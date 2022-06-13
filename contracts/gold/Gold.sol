//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Gold is ERC20, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// For blacklist feature
    mapping(address => bool) private _blackList;
    event BlackListAdded(address account);
    event BlackListRemoved(address account);

    constructor() ERC20("GOLD", "GLD") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        require(_blackList[from] == false, "Gold: account sender was on blacklist");
        require(_blackList[to] == false, "Gold: account recipient was on blacklist");
        super._beforeTokenTransfer(from, to, amount);
    }

    function addToBlackList(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != msg.sender, "Gold: must not add sender to blacklist");
        require(_blackList[account] != true, "Gold: account was on blacklist");
        _blackList[account] = true;
        emit BlackListAdded(account);
    }

    function removeFromBlackList(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_blackList[account] == true, "Gold: account was not on blacklist");
        _blackList[account] = false;
        emit BlackListRemoved(account);
    }
}