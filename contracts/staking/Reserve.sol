// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Staking reserve is a contract that holds tokens from staking actions and allows
//  the staking contract to take the amount to interest their profit

contract StakingReserve is Ownable {
    IERC20 public gold;
    address public stakeAddress;

    constructor(address _goldAdress, address _stakeAddress) {
        gold = IERC20(_goldAdress);
        stakeAddress = _stakeAddress;
    }

    function getBalanceOfReserve() public view returns (uint256) {
        return gold.balanceOf(address(this));
    }

    function distributeGold(address _recipientAddress, uint256 _amount) public {
        require(msg.sender == stakeAddress);
        gold.transfer(_recipientAddress, _amount);
    }
}
