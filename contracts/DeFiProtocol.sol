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

    // ::::::::::::: Properties ::::::::::::: //

    /**
     * @notice This mapping store the amount of liquidity by address
     */
    mapping(address => uint256) storedValuePerAddress;

    /**
     * @notice The Total Value Locked(TVL) of the liquidity pool
     * @dev The TVL is public because front may want to display it
     */
    uint256 public totalValueLocked = 0;
    
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
    uint64 customTokenMultiplier = 800000000000000000;

    // ::::::::::::: Modifiers ::::::::::::: //

    /**
     * @notice Modifier that allow only amount greater than zero to be staked or unstaked
     */
    modifier onlyAmountGreaterThanZero(uint256 _amount) {
        require(_amount > 0, "Only amount above zero are authorized");
        _;
    }

    // ::::::::::::: Events ::::::::::::: //

    /**
     * @notice Event informing an amount was staked in the Liquidity Pool
     * @param staker The address that staked
     * @param stakedAmount The amount that has been staked
     */
    event AmountStaked (address staker, uint256 stakedAmount);

    /**
     * @notice Event informing an amount was unstaked in the Liquidity Pool
     * @param staker The address that unstaked
     * @param unstakedAmount The amount that has been unstaked
     */
    event AmountUnstaked (address staker, uint256 unstakedAmount);

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
    function stake(uint256 _amount) payable external onlyAmountGreaterThanZero(_amount) {
        require(_amount > 0, "You can only insert a value greater than 0");
        require(token.transferFrom(msg.sender, address(this), _amount), "You must have the balance in your wallet and approve this contract");
        
        // Update the tvl of the liquidity pool
        totalValueLocked = totalValueLocked  + _amount;

        // Update the locked amount of the sender
        storedValuePerAddress[msg.sender] = storedValuePerAddress[msg.sender] + _amount;
        
        emit AmountStaked(msg.sender, _amount);
    }

    /**
     * @notice Unstake the tokens in the Liquidity pool, user can retrieve their tokens
     * @dev Refresh the stored amount in the address mapping storedValuePerAddress and refresh the TVL
     * @param _amount Total amount to unstake from the liquidity pool
     */
    function unstake(uint256 _amount) payable external onlyAmountGreaterThanZero(_amount) {
        // Check if the sender have this amount in pool
        require(storedValuePerAddress[msg.sender] >= _amount, "You didn't stored this amount in the pool");

        // Update the tvl of the liquidity pool
        totalValueLocked = totalValueLocked  - _amount;

        // Update the locked amount of the sender
        storedValuePerAddress[msg.sender] = storedValuePerAddress[msg.sender] - _amount;

        // Send the token back to the sender
        token.transfer(msg.sender, _amount);
        
        emit AmountUnstaked(msg.sender, _amount);
    }

    /**
     * @notice Get the msg.sender token staked amount
     * @return stakedAmount token staked by msg.sender
     */
    function getStakedAmount() external view returns (uint256 stakedAmount) {
        return(storedValuePerAddress[msg.sender]);
    }

    /**
     * @notice Get the token price in USD
     * @dev USD Price is retrieved thanks to Chainlink
     * @dev Can't be unit tested because of Ganache
     * @return price price of the token
     */
    function getTokenPrice() external view returns (int price) {

        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();

        return(price);
    }
}