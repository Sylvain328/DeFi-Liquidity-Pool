import React from 'react';
import WithdrawDepositTabs from "./WithdrawDepositTabs.js";
import Deposit from "./Deposit.js";
import Withdraw from "./Withdraw.js";
import DataContainer from "./DataContainer.js";
import RateConverter from "../utils/rateConverter.js";

export default class LiquidityPool extends React.Component {

    state = {walletBalance: 0, tokenPrice: 0, poolTvl: 0, poolTvlUsd: 0, userStaked: 0, userStakedUsd: 0, userReward: 0, userRewardUsd: 0}
    
    componentDidMount = async() => {

        this.state.tokenPrice = await this.props.requestManager.getHwtTokenUsdValue();

        // Bind the method triggered by pool buttons Deposit and Withdraw
        this.depositTokens = this.depositTokens.bind(this);
        this.withdrawTokens = this.withdrawTokens.bind(this);

        // Listent the Withdraw and deposit events
        this.listenWithdrawEvent();
        this.listenDepositEvent();

        // Initialize pool data
        await this.computePoolTvl();
        await this.computeUserStaked();
        await this.computeUserReward();
        await this.updateUserWalletBalance();

        // Create a refresh interval for the reward amount
        this.refreshRewardInterval = setInterval(async () => await this.computeUserReward(), 5000);     
    }

    componentWillUnmount = async() => {
        // Clear the interval when component is unmounted to avoir an error
        clearInterval(this.refreshRewardInterval);
    }

    /**
     * Compute the TVL and setState the TVL and TVL in USD of the pool
     */
    computePoolTvl = async() => {

        let poolTvl = await this.props.requestManager.getSinglePoolTvl();
        let poolTvlUsd = poolTvl * this.state.tokenPrice;
        this.setState({poolTvl: poolTvl.toFixed(4), poolTvlUsd: poolTvlUsd.toFixed(4)}); 
    } 
    
    /**
     * Compute the amount and setState the user stakedAmount and stakedAmount in Usd of the pool
     */
    computeUserStaked = async() => {
        
        let userStaked = await this.props.requestManager.getPoolStakedAmount();
        let userStakedUsd = userStaked * this.state.tokenPrice;
        this.setState({ userStaked: userStaked.toFixed(4), userStakedUsd: userStakedUsd.toFixed(4) }); 
    }

    /**
     * Compute the reward and setState the user reward and user reward in Usd of the pool
     */
    computeUserReward = async() => {

        let userReward = await this.props.requestManager.getPoolRewardAmount();
        let userRewardUsd = userReward * this.state.tokenPrice;
        this.setState({ userReward: userReward.toFixed(4), userRewardUsd: userRewardUsd.toFixed(4) }); 
    }

    /**
     * Get the user Balance for the pool token
     */
     updateUserWalletBalance = async() => {

        let walletBalance = await this.props.requestManager.getTokenBalance();
        this.setState({ walletBalance: walletBalance.toFixed(4) }); 
    }

    /**
     * Listen the Withdraw event to refresh Liquidity pool data
     */
    listenWithdrawEvent = async() => {

        let instance = this.props.requestManager.getProtocolEvents();
        let eventOptions = await this.props.requestManager.getBaseEventOptions();

        // When amount is unstaked, data should be refresh
        await instance.events
        .AmountUnstaked(eventOptions)
        .on('data', async event => {
            
            // Refresh the pool TVL, even if the event isn't for this account
            await this.computePoolTvl();

            // Refresh the user pool data only if the event is triggered by the user
            if(event.returnValues[0] === this.props.requestManager.account) {
                
                // Refresh staked amount and staked amount price in US
                let userStaked = RateConverter.convertToEth(event.returnValues[1]);
                let userStakedUsd = userStaked * this.state.tokenPrice;
                this.setState({userStaked: userStaked, userStakedUsd: userStakedUsd});
                // Update the user wallet balance
                await this.updateUserWalletBalance();
            }
        });
    }

    /**
     * Listen the deposit event to refresh Liquidity pool data
     */
    listenDepositEvent = async() => {

        let instance = this.props.requestManager.getProtocolEvents();
        let eventOptions = await this.props.requestManager.getBaseEventOptions();

        // When amount is staked, data should be refresh
        await instance.events
        .AmountStaked(eventOptions)
        .on('data', async event => {
            // Refresh the pool TVL, even if the event isn't for this account
            await this.computePoolTvl();

            // Run the refresh only if the event comes from the connected account
            if(event.returnValues[0] === this.props.requestManager.account) {
                await this.updateUserWalletBalance();
                await this.computeUserStaked(); 
            }
        });
    }

    /**
     * Deposit the amount selected by the user - Triggered when user click on the deposit button
     */
    depositTokens = async (_amount) => {
        await this.props.requestManager.deposit(_amount);
    }

    /**
     * Withdraw the amount selected by the user - Triggered when user click on the withdraw button
     */
    withdrawTokens = async (_amount) => {
        await this.props.requestManager.withdraw(_amount);
    }

    /**
     * Claim the user reward on the pool - Triggered when the user click on the "claim reward" button
     */
    claimReward = async() => {
        await this.props.requestManager.claimPoolReward();
    }

    render(){
        return(
            <div className='LiquidityPool'>
                <div className='HwtLogo'>
                </div>
                <div className="PoolBaseInfo">
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='Daily reward' indicatorValue='8' indicatorUnit='%'/>
                </div>
                <div className="PoolStakedAmount">
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='TVL' indicatorValue={this.state.poolTvl} indicatorUnit='HWT'/>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='TVL $' indicatorValue={this.state.poolTvlUsd} indicatorUnit='USD'/>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='User staked' indicatorValue={this.state.userStaked} indicatorUnit='HWT'/>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='User staked $' indicatorValue={this.state.userStakedUsd} indicatorUnit='USD'/>
                </div>
                <WithdrawDepositTabs>
                    <div label='Deposit'>
                        <Deposit walletBalance={this.state.walletBalance} depositTokens={this.depositTokens} />
                    </div>
                    <div label='Withdraw'>
                        <Withdraw userStaked={this.state.userStaked} withdrawTokens={this.withdrawTokens} />
                    </div>
                </WithdrawDepositTabs>
                <div className='RewardContent'>
                    <div className='RewardPoolTitle'>
                        <h3>Reward</h3>
                    </div>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='Reward HWT' indicatorValue={this.state.userReward} indicatorUnit='HWT'/>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='Reward Value' indicatorValue={this.state.userRewardUsd} indicatorUnit='USD'/>
                    <div className='ClaimRewardButton' onClick={this.claimReward}>Claim Reward</div>
                </div>
            </div>
        )
    }
}