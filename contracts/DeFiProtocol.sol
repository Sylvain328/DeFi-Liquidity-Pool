// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title Hello World DeFi Protocol
 * @author The Hello World Team
 * @notice This contract offer the possibility to stake ERC20 in Liquidity Pools to receive Hello World Token rewards
 */
contract DeFiProtocol is Ownable {


    // :::::::::::::: Struct ::::::::::::::: //

    /**
     * @notice This struct contains the data of a Staker
     */
    struct StakerData {
        uint256 stakedAmount; 
        uint256 updateTimestamp;
        uint256 reward;
    }

    /**
     * @notice Contain liquidity pool data
     * @dev aggregator address is used to get price over the Chainlink Oracle
     */
    struct LiquidityPoolData {
        bool isAuthorized;
        uint rewardPerSecond;
        address oracleAggregatorAddress;
        uint totalValueLocked;
        mapping(address => StakerData) stakerData;
    }

    // ::::::::::::: Properties ::::::::::::: //

    /**
     * @notice This mapping store liquidity pool data per token address
     */
    mapping(address => LiquidityPoolData) liquidityPoolData;

    /**
     * @notice Token multiplier to give a price on the Hwt token
     * @dev As our Hwt token don't have any value on the market, we use a basic multiplier
     */
    uint public hwtTokenUsdValue = 931500000000000000;

    /**
     * @notice Token multiplier to give a price on the Flp token
     * @dev As our Flp token don't have any value on the market, we use a basic multiplier
     */
    uint public flpTokenUsdValue = 4932100000000000000;

    // ::::::::::::: Modifiers ::::::::::::: //

    /**
     * @notice Modifier that allow only authorizedToken for liquidity pool
     */
    modifier onlyAuthorizedToken(address _tokenAddress) {
        require(liquidityPoolData[_tokenAddress].isAuthorized, "Only Authorized token can do this action");
        _;
    }

    /**
     * @notice Modifier that allow only amount greater than zero to be staked or unstaked
     */
    modifier onlyAmountGreaterThanZero(uint _amount) {
        require(_amount > 0, "Only amount above zero are authorized");
        _;
    }

    // ::::::::::::: Events ::::::::::::: //

    /**
     * @notice Event informing the staked amount was updated
     * @param sender The address that staked in the pool
     * @param tokenAddress The liquidity pool token
     * @param stakedAmount The amount that has been staked
     */
    event StakedAmountUpdated (address sender, address tokenAddress, uint stakedAmount);

    /** 
     * @notice Event informing a reward was send
     * @param sender The address that claim the reward
     * @param tokenAddress The liquidity pool token
     * @param rewardClaimedAmount The amount that has been offered
     */
    event RewardOffered (address sender, address tokenAddress, uint rewardClaimedAmount);

    /**
     * @notice Event informing a new token is authorized for liquidity pools
     * @param tokenAddress The address of the new authorized token
     * @param rewardPerSecond The reward rate per second
     */
    event TokenAuthorized (address tokenAddress, uint rewardPerSecond);

    // ::::::::::::: Methods ::::::::::::: //

    /**
     * @notice Create a new pool with an erc20 token
     * @param _tokenAddress the erc20 token address
     * @param _oracleAggregatorAddress The oracle aggregator address that will permit to get the token price in USD
     * @param _rewardPerSecond The win rate of the liquidity pool
     */
    function createLiquidityPool(address _tokenAddress, address _oracleAggregatorAddress, uint _rewardPerSecond) external onlyOwner {
        require(!liquidityPoolData[_tokenAddress].isAuthorized, "This token is already authorized");

        liquidityPoolData[_tokenAddress].rewardPerSecond = _rewardPerSecond;
        liquidityPoolData[_tokenAddress].oracleAggregatorAddress = _oracleAggregatorAddress;
        liquidityPoolData[_tokenAddress].isAuthorized = true;

        emit TokenAuthorized(_tokenAddress, _rewardPerSecond);
    }

    /**
     * @notice Stake token in the Liquidity pool
     * @dev Refresh the stored amount in the address mapping storedValuePerAddress and refresh the TVL
     * @param _tokenAddress The token address to stake in liquidity pool
     * @param _amount Total amount to store in the liquidity pool
     */
    function stake(address _tokenAddress, uint _amount) payable external onlyAuthorizedToken(_tokenAddress) onlyAmountGreaterThanZero(_amount) {
        
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);

        // Get the liquidity pool data
        LiquidityPoolData storage poolData = liquidityPoolData[_tokenAddress];
        // Get the staker data
        StakerData storage stakerData = poolData.stakerData[msg.sender];

        // if tokens are already stored, update reward before the new stake
        if(stakerData.stakedAmount > 0) {
            stakerData.reward = computeReward(stakerData, poolData.rewardPerSecond);
        }

        // Update the staked amount and the timestamp to compute new amount reward at this specific time
        stakerData.stakedAmount = stakerData.stakedAmount + _amount;
        stakerData.updateTimestamp = block.timestamp; 

        // Update the tvl of the liquidity pool
        poolData.totalValueLocked = poolData.totalValueLocked  + _amount;

        emit StakedAmountUpdated(msg.sender, _tokenAddress, stakerData.stakedAmount);
    }

    /**
     * @notice Unstake the tokens in the Liquidity pool, user can retrieve their tokens
     * @dev Refresh the stored amount in the address mapping stakerDataPerAddress and refresh the TVL
     * @param _tokenAddress The token address to unstake from liquidity pool
     * @param _amount Total amount to unstake from the liquidity pool
     */
    function unstake(address _tokenAddress, uint256 _amount) payable external onlyAuthorizedToken(_tokenAddress) onlyAmountGreaterThanZero(_amount) {
        
        // Get the liquidity pool data
        LiquidityPoolData storage poolData = liquidityPoolData[_tokenAddress];

        // Get the staker data
        StakerData storage stakerData = poolData.stakerData[msg.sender];
        
        // Check if the sender have this amount in pool
        require(_amount <= stakerData.stakedAmount, "You didn't stored this amount in the pool");

        // Update the reward first ! Then update staked amount and timestamp
        stakerData.reward = computeReward(stakerData, poolData.rewardPerSecond);

        // Update the staked amount and the timestamp to compute new amount reward at this specific time
        stakerData.stakedAmount = stakerData.stakedAmount - _amount;
        stakerData.updateTimestamp = block.timestamp;

        // Update the tvl of the liquidity pool
        poolData.totalValueLocked = poolData.totalValueLocked  - _amount;

        // Send the token back to the sender
        IERC20(_tokenAddress).transfer(msg.sender, _amount);
        
        emit StakedAmountUpdated(msg.sender, _tokenAddress, stakerData.stakedAmount);
    }

    /**
     * @notice Get the msg.sender token staked amount
     * @param _tokenAddress The address of the token to check for staked amount
     * @return stakedAmount token staked by msg.sender
     */
    function getStakedAmount(address _tokenAddress) external view onlyAuthorizedToken(_tokenAddress) returns (uint stakedAmount) {
        return(liquidityPoolData[_tokenAddress].stakerData[msg.sender].stakedAmount);
    }

    /**
     * @notice Get the token price in USD
     * @dev USD Price is retrieved thanks to Chainlink
     * @param _tokenAddress The authorized token address to get price
     * @return int price of the token
     */
    function getTokenPrice(address _tokenAddress) external view onlyAuthorizedToken(_tokenAddress) returns (int) {

        // Retrieve oracle address
        address oracleAddress = liquidityPoolData[_tokenAddress].oracleAggregatorAddress;
        AggregatorV3Interface priceFeed = AggregatorV3Interface(oracleAddress);

        // get price
        (
            /* uint80 roundID */,
            int price,
            /* uint256 startedAt, */,
            /* uint256 timeStamp, */,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();

        return(price);
    }

    /**
     * @notice Get the reward for msg.sender
     * @param _tokenAddress The token address to get liquidity pool reward of this token
     * @return reward The reward computed by the contract
     */
    function getRewardAmount(address _tokenAddress) external view onlyAuthorizedToken(_tokenAddress) returns (uint reward) {
        return(computeReward(liquidityPoolData[_tokenAddress].stakerData[msg.sender], liquidityPoolData[_tokenAddress].rewardPerSecond));
    }

    /**
     * @notice Compute the reward depending on time and existant reward
     * @dev Timestamp are in seconds
     * @param _stakerData Data of the staker
     * @return rewardAmount The computed reward amount
     */
    function computeReward(StakerData memory _stakerData, uint _rewardPerSecond) private view returns(uint rewardAmount) {
        
        uint reward = ((block.timestamp - _stakerData.updateTimestamp) * _rewardPerSecond * _stakerData.stakedAmount);

        if(reward > 0) {
            return _stakerData.reward + (reward / 1e18);
        }
        else {
            return _stakerData.reward;
        }
    }

    /**
     * @notice Send then reward to the msg.sender
     * @param _tokenAddress The token address to claim reward from the pool
     */
    function claimReward(address _tokenAddress) external onlyAuthorizedToken(_tokenAddress) {

        // Get the staker data
        StakerData storage stakerData = liquidityPoolData[_tokenAddress].stakerData[msg.sender];

        // Compute the reward
        uint reward = computeReward(stakerData, liquidityPoolData[_tokenAddress].rewardPerSecond);

        require(reward > 0, "No reward to claim");
        
        // Update the timestamp and the reward amount
        stakerData.updateTimestamp = block.timestamp;
        stakerData.reward = 0;

        // Send reward tokens to the msg.sender
        IERC20(_tokenAddress).transfer(msg.sender, reward);

        emit RewardOffered(msg.sender, _tokenAddress, reward);
    }

    /**
     * @notice Get the total value Locked of a liquidity pool
     * @param _tokenAddress The token address for the liquidity pool
     * @return uint The TVL of the pool
     */
    function getTotalValueLocked(address _tokenAddress) external view onlyAuthorizedToken(_tokenAddress) returns (uint) {

        return liquidityPoolData[_tokenAddress].totalValueLocked;
    }

    /**
     * @notice Get the reward rate per second
     * @param _tokenAddress The token address for the liquidity pool
     * @return uint The Reward per second for the pool
     */
    function getRewardPerSecond(address _tokenAddress) external view onlyAuthorizedToken(_tokenAddress) returns (uint) {

        return liquidityPoolData[_tokenAddress].rewardPerSecond;
    }
}