// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Reserve.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Staking is Ownable {
    using Counters for Counters.Counter;
    // Save token gold for paying profit
    StakingReserve public immutable reserve;
    IERC20 public immutable gold;
    // Emit when user puts more money into his stake pakage
    event StakeUpdate(
        address account,
        uint256 packageId,
        uint256 amount,
        uint256 totalProfit
    );
    // Emit when a staking pakage done
    event StakeReleased(
        address account,
        uint256 packageId,
        uint256 amount,
        uint256 totalProfit
    );

    struct StakePackage {
        uint256 rate; // % profit per year
        uint256 decimal;
        uint256 minStaking; // min staking value
        uint256 lockTime; // lock time before user can unstake
        bool isOffline;
    }
    struct StakingInfo {
        uint256 startTime;
        uint256 timePoint;
        uint256 amount;
        uint256 totalProfit;
    }
    // Counting stake pakage number
    Counters.Counter private _stakePackageCount;
    // Store stake pakages of this contract
    mapping(uint256 => StakePackage) public stakePackages;
    // Store stakes of an address
    mapping(address => mapping(uint256 => StakingInfo)) public stakes;

    /**
     * @dev Initialize
     * @notice This is the initialize function, run on deploy event
     * @param tokenAddr_ address of main token
     * @param reserveAddress_ address of reserve contract
     */
    constructor(address tokenAddr_, address reserveAddress_) {
        gold = IERC20(tokenAddr_);
        reserve = StakingReserve(reserveAddress_);
    }

    /**
     * @dev Add new staking package
     * @notice New package will be added with an id
     */
    function addStakePackage(
        uint256 rate_,
        uint256 decimal_,
        uint256 minStaking_,
        uint256 lockTime_
    ) public onlyOwner {
        require(rate_ > 0, "Staking: rate_ must be lagger than 0");
        require(minStaking_ > 0, "Staking: minStaking_ must be lagger than 0");
        require(lockTime_ > 0, "Staking: lockTime_ must be lagger than 0");

        // Increate number of stake pakage of this contract
        _stakePackageCount.increment();
        // Add new stake pakage to current pakageId
        uint256 pakageId_ = _stakePackageCount.current();
        stakePackages[pakageId_] = StakePackage(
            rate_,
            decimal_,
            minStaking_,
            lockTime_,
            false
        );
    }

    /**
     * @dev Remove an stake package
     * @notice A stake package with packageId will be set to offline
     * so none of new staker can stake to an offine stake package
     */
    function removeStakePackage(uint256 packageId_) public onlyOwner {
        // Verify input param
        require(packageId_ > 0, "Staking: packageId_ must be lagger than 0");
        // Verify packageId_
        StakePackage storage stakePakage_ = stakePackages[packageId_];
        require(stakePakage_.rate > 0, "Staking: Stake pakage is not exits");
        require(
            stakePakage_.isOffline == false,
            "Staking: Stake pakage had been removed"
        );
        // Update stake pakage
        stakePakage_.isOffline = true;
    }

    /**
     * @dev User stake amount of gold to stakes[address][packageId]
     * @notice if is there any amount of gold left in the stake package,
     * calculate the profit and add it to total Profit,
     * otherwise just add completely new stake.
     */
    function stake(uint256 amount_, uint256 packageId_) external {
        // Verify input param
        require(amount_ > 0, "Staking: amount_ must be lagger than 0");
        require(packageId_ > 0, "Staking: packageId_ must be lagger than 0");
        // Verify packageId_
        StakePackage storage stakePakage_ = stakePackages[packageId_];
        require(stakePakage_.rate > 0, "Staking: packageId_ is not exits");
        require(
            stakePakage_.isOffline == false,
            "Staking: packageId_ had been removed"
        );
        require(
            amount_ > stakePakage_.minStaking,
            "Staking: amount_ must be lagger than minStaking"
        );

        // Transfer gold token from sender to reserve contract
        gold.transferFrom(_msgSender(), address(reserve), amount_);
        // Init new stake for sender address
        // OR update current user's stake
        StakingInfo storage _stakingInfo = stakes[_msgSender()][packageId_];
        // User had stake before
        if (_stakingInfo.amount > 0) {
            // Update current stake
            uint256 _totalProfit = calculateProfit(packageId_);
            _stakingInfo.amount += amount_;
            _stakingInfo.timePoint = block.timestamp;
            _stakingInfo.totalProfit = _totalProfit;
        } else {
            // Init new stake
            _stakingInfo.amount = amount_;
            _stakingInfo.startTime = block.timestamp;
            _stakingInfo.timePoint = block.timestamp;
            _stakingInfo.totalProfit = 0;
        }

        emit StakeUpdate(
            _msgSender(),
            packageId_,
            _stakingInfo.amount,
            _stakingInfo.totalProfit
        );
    }

    /**
     * @dev Take out all the stake amount and profit of account's stake from reserve contract
     */
    function unStake(uint256 packageId_) external {
        // Verify input param
        require(packageId_ > 0, "Staking: packageId_ must be lagger than 0");
        // Verify stakingInfo
        StakingInfo storage stakingInfo_ = stakes[_msgSender()][packageId_];
        require(stakingInfo_.amount > 0, "Staking: Staking not found");
        require(
            block.timestamp - stakingInfo_.timePoint >=
                stakePackages[packageId_].lockTime,
            "Staking: Not reach lock time"
        );

        // Get total amount = profit + staking amount to pay for user
        uint256 _profit = calculateProfit(packageId_);
        uint256 _stakeAmount = stakingInfo_.amount;
        // Clear stakingInfo
        stakingInfo_.amount = 0;
        stakingInfo_.startTime = 0;
        stakingInfo_.timePoint = 0;
        stakingInfo_.totalProfit = 0;

        // Pay total amount for user
        reserve.distributeGold(_msgSender(), _profit + _stakeAmount);
        emit StakeReleased(msg.sender, packageId_, _stakeAmount, _profit);
    }

    /**
     * @dev calculate current profit of an package of user known packageId
     */
    function calculateProfit(uint256 packageId_) public view returns (uint256) {
        StakingInfo memory _stakingInfo = stakes[_msgSender()][packageId_];
        uint256 _stakeTime = block.timestamp - _stakingInfo.timePoint;
        uint256 _profit = (_stakeTime *
            _stakingInfo.amount *
            stakePackages[packageId_].rate) /
            10**stakePackages[packageId_].decimal;
        return _stakingInfo.totalProfit + _profit;
    }

    function getAprOfPackage(uint256 packageId_) public view returns (uint256) {
        return stakePackages[packageId_].rate * 365 * 86400;
    }
}
