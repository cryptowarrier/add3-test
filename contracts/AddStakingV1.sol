// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract AddStakingV1 {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public token;

  struct StakeInfo {
    uint256 amount;
    uint256 lastUpdate;
  }

  mapping(address => StakeInfo) public stakes;
  uint256 public totalStakes;
  uint256 public rewardRate; // percentage
  bool private isInitialized;

  function intialize(address _token, uint256 _rewardRate) public {
      require(!isInitialized, "Already initialized");
      token = IERC20(_token);
      rewardRate = _rewardRate;
      isInitialized = true;
  }

  function stake(uint256 amount) public {
      require(amount > 0, "Amount must be greater than zero");
      require(token.balanceOf(msg.sender) >= amount, "Insufficient balance");
      uint256 reward = calculateRewards(msg.sender);
      // send reward to user if reward is not zero
      if (reward > 0) {
        token.safeTransfer(msg.sender, reward);
      }
      // tranfer token from user to smart contract
      token.safeTransferFrom(msg.sender, address(this), amount);
      // update stake info
      stakes[msg.sender].amount += amount;
      stakes[msg.sender].lastUpdate = block.timestamp;
      totalStakes += amount;
  }
  // 1- This does not follow the Check-Effects-Interaction safety protocol https://fravoll.github.io/solidity-patterns/checks_effects_interactions.html
  // 2- Is a bit difficult to understand why to send rewards and stake tokens one after the other. Isn't better to account the gained rewards and let the user withdraw separately? 

  function unstake(uint256 amount) public {
      require(amount > 0, "Amount must be greater than zero");
      require(stakes[msg.sender].amount >= amount, "Insufficient stake");
      uint256 reward = calculateRewards(msg.sender);
      // send reward to user if reward is not zero
      if (reward > 0) {
        token.safeTransfer(msg.sender, reward);
      }
      // update stake info
      stakes[msg.sender].amount -= amount;
      stakes[msg.sender].lastUpdate = block.timestamp;
      totalStakes -= amount;
      // transfer token from smart contract to user
      token.safeTransfer(msg.sender, amount);
  }
  // see above point 1-
  // 2- Why to make two transfers ? 
  // 
  // can't you do ...
  //
  // uint256 reward = calculateRewards(msg.sender);
  // ////////THEN//////// 
  // token.safeTransfer(msg.sender, amount + rewards); // if rewards is zero is not added to the value, if is something is all sent in once transaaction. This saves gass

  function claimRewards() public {
      uint256 reward = calculateRewards(msg.sender);
      require(reward > 0, "No rewards to claim");
      if (reward > 0) {
        token.safeTransfer(msg.sender, reward);
      }
      stakes[msg.sender].lastUpdate = block.timestamp;
  }
  // 1- Sorry but where do you account that the user has withdrawn yet the rewards yet? I think that this function call is at reentrancy risk
  // 2- This way of coding does not follow the Check-Effect-Interaction safe protocol
  
  function calculateRewards(address account) public view returns (uint256) {
      uint256 timeSinceLastUpdate = block.timestamp.sub(stakes[account].lastUpdate);
      // if reward rate is 100 and staked 365 days, reward amount is 100% of staked amount
      return stakes[account].amount.mul(rewardRate).mul(timeSinceLastUpdate).div(365 days).div(100);
  }
  // This works only with static rate (fixed staking)
  // How do you handle the dynamic rate ? 

}
