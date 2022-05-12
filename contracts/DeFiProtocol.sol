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


    // ::::::::::::: Properties ::::::::::::: //

    /**
     * @notice This mapping store the amount of liquidity and reward by address
     */
    mapping(address => StakerData) stakerDataPerAddress;

    /**
     * @notice The Total Value Locked(TVL) of the liquidity pool
     * @dev The TVL is public because front may want to display it
     */
    uint256 public totalValueLocked;
    
    /**
     * @notice The Token to store in the liquidity pool
     * @dev Initialized on the constructor
     */
    IERC20 token;

    /**
     * @notice Retrieve the token price
     * @dev Use Chainlink to retrieve the USD price of the token
     */
    AggregatorV3Interface internal priceFeed;

    /**
     * @notice Token multiplier to give a price on the Hwt token
     * @dev As our Hwt token don't have any value on the market, we use a basic multiplier
     */
    uint public hwtTokenUsdValue = 931500000000000000;

    /**
     * @notice reward per second for the liquidity pool
     */
    uint rewardPerSecond = 925925925925;

    // ::::::::::::: Modifiers ::::::::::::: //

    /**
     * @notice Modifier that allow only amount greater than zero to be staked or unstaked
     */
    modifier onlyAmountGreaterThanZero(uint _amount) {
        require(_amount > 0, "Only amount above zero are authorized");
        _;
    }

    // ::::::::::::: Events ::::::::::::: //

    /**
     * @notice Event informing total amount staked in the Liquidity Pool
     * @param sender The address that staked in the pool
     * @param stakedAmount The amount that has been staked
     */
    event AmountStaked (address sender, uint stakedAmount);

    /**
     * @notice Event informing an amount was unstaked in the Liquidity Pool
     * @param sender The address that unstaked in the pool
     * @param unstakedAmount The amount that has been unstaked
     */
    event AmountUnstaked (address sender, uint unstakedAmount);

    /** 
     * @notice Event informing a reward was send
     * @param sender The address that claim the reward
     * @param rewardClaimedAmount The amount that has been offered
     */
    event RewardOffered (address sender, uint rewardClaimedAmount);

    // ::::::::::::: Methods ::::::::::::: //

    /**
     * @notice Create erc20 instance that will be used for the liquidity pool
     * @param _tokenAddress the smart contract address of the erc20 token
     */
    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
        // Link/USD price feed
        priceFeed = AggregatorV3Interface(0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c);
    }

    /**
     * @notice Stake token in the Liquidity pool
     * @dev Refresh the stored amount in the address mapping storedValuePerAddress and refresh the TVL
     * @param _amount Total amount to store in the liquidity pool
     */
    function stake(uint _amount) payable external onlyAmountGreaterThanZero(_amount) {
        
        token.transferFrom(msg.sender, address(this), _amount);

        // Update the locked amount of the sender
        StakerData storage stakerData = stakerDataPerAddress[msg.sender];

        // if tokens are already stored, update reward before the new stake
        if(stakerData.stakedAmount > 0) {
            stakerData.reward = computeReward(stakerData);
        }

        stakerData.stakedAmount = stakerData.stakedAmount + _amount;
        stakerData.updateTimestamp = block.timestamp; 

        // Update the tvl of the liquidity pool
        totalValueLocked = totalValueLocked  + _amount;

        emit AmountStaked(msg.sender, stakerData.stakedAmount);
    }

    /**
     * @notice Unstake the tokens in the Liquidity pool, user can retrieve their tokens
     * @dev Refresh the stored amount in the address mapping stakerDataPerAddress and refresh the TVL
     * @param _amount Total amount to unstake from the liquidity pool
     */
    function unstake(uint256 _amount) payable external onlyAmountGreaterThanZero(_amount) {
        
        StakerData storage stakerData = stakerDataPerAddress[msg.sender];
        
        // Check if the sender have this amount in pool
        require(_amount <= stakerData.stakedAmount, "You didn't stored this amount in the pool");

        // Update the reward first ! Then update staked amount and timestamp
        //stakerData.reward = computeReward(stakerData);

        stakerData.stakedAmount = stakerData.stakedAmount - _amount;
        stakerData.updateTimestamp = block.timestamp;

        // Update the tvl of the liquidity pool
        totalValueLocked = totalValueLocked  - _amount;

        // Send the token back to the sender
        token.transfer(msg.sender, _amount);
        
        emit AmountUnstaked(msg.sender, stakerData.stakedAmount);
    }

    /**
     * @notice Get the msg.sender token staked amount
     * @return stakedAmount token staked by msg.sender
     */
    function getStakedAmount() external view returns (uint stakedAmount) {
        return(stakerDataPerAddress[msg.sender].stakedAmount);
    }

    function getTimeStamp() external view returns (uint actualStamp, uint userStamp) {
        return(block.timestamp, stakerDataPerAddress[msg.sender].updateTimestamp);
    }

    /**
     * @notice Get the token price in USD
     * @dev USD Price is retrieved thanks to Chainlink
     * @dev Can't be unit tested because of Ganache
     * @return tokenPrice price of the token
     */
    function getTokenPrice() external view returns (int tokenPrice) {

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
     * @return reward The reward computed by the contract
     */
    function getRewardAmount() external view returns (uint reward) {
        return(computeReward(stakerDataPerAddress[msg.sender]));
    }

    /**
     * @notice Compute the reward depending on time and existant reward
     * @dev Timestamp are in seconds
     * @param _stakerData Data of the staker
     * @return rewardAmount The computed reward amount
     */
    function computeReward(StakerData memory _stakerData) private view returns(uint rewardAmount) {
        
        uint reward = ((block.timestamp - _stakerData.updateTimestamp) * rewardPerSecond * _stakerData.stakedAmount);

        if(reward > 0) {
            return _stakerData.reward + (reward / 1e18);
        }
        else {
            return _stakerData.reward;
        }
    }

    /**
     * @notice Send then reward to the msg.sender
     */
    function claimReward() external {

        StakerData storage stakerData = stakerDataPerAddress[msg.sender];

        // Compute the reward
        uint reward = computeReward(stakerData);

        require(reward > 0, "No reward to claim");
        
        // Update the timestamp and the reward amount
        stakerData.updateTimestamp = block.timestamp;
        stakerData.reward = 0;

        // Send reward tokens to the msg.sender
        token.transfer(msg.sender, reward);

        emit RewardOffered(msg.sender, reward);
    }
}