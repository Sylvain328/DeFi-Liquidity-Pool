import React from 'react';
import WithdrawDepositTabs from "./WithdrawDepositTabs.js";
import Deposit from "./Deposit.js";
import Withdraw from "./Withdraw.js";
import DataContainer from "./DataContainer.js";
import RateConverter from "../utils/rateConverter.js";

export default class LiquidityPool extends React.Component {

    state = {
        liquidityPool: null, 
        symbol: null, 
        dailyReward: 0,
        walletBalance: 0, 
        tokenPrice: 0, 
        poolTvl: 0, 
        poolTvlUsd: 0, 
        userStaked: 0, 
        userStakedUsd: 0, 
        userReward: 0, 
        userRewardUsd: 0
    }
    
    componentDidMount = async() => {

        // Fixed state
        this.state.liquidityPool = this.props.liquidityPool;
        this.setState({
            liquidityPool: this.state.liquidityPool, 
            symbol: this.props.liquidityPool.symbol, 
            dailyReward: this.props.liquidityPool.dailyReward,
            cssLogoClass: this.props.liquidityPool.cssLogoClass});

        // Refresh variable state
        this.initializePoolData();

        // Bind the method triggered by pool buttons Deposit and Withdraw
        this.depositTokens = this.depositTokens.bind(this);
        this.withdrawTokens = this.withdrawTokens.bind(this);

        // Listen when staked amount is update to refresh data
        this.listenStakedAmountUpdatedEvent();

        // Create a refresh interval for the reward amount
        this.refreshRewardInterval = setInterval(async () => {
            await this.updateRewardAmount()
            this.props.updateAllPoolsData();
        }, 10000);     
    }

    componentWillUnmount = async() => {
        // Clear the interval when component is unmounted to avoir an error
        clearInterval(this.refreshRewardInterval);
    }

    initializePoolData = async() => {
        this.setState({
            poolTvl: this.state.liquidityPool.poolTvl,
            poolTvlUsd: this.state.liquidityPool.poolTvlUsd, 
            tokenPrice: this.state.liquidityPool.tokenPrice,
            walletBalance: this.state.liquidityPool.walletBalance,
            userStaked: this.state.liquidityPool.userStaked,
            userStakedUsd: this.state.liquidityPool.userStakedUsd,
            userReward: this.state.liquidityPool.userReward,
            userRewardUsd: this.state.liquidityPool.userRewardUsd
        });
    }

    updateGlobalPoolData = async() => {

        await this.state.liquidityPool.refreshGlobalPoolData();

        // If token price change, then the usd stakedAmount have to be recomputed
        // This case happens when the event is called
        if(this.state.tokenPrice != this.state.liquidityPool.tokenPrice) {
            this.state.liquidityPool.userStakedUsd = this.state.liquidityPool.userStaked * this.state.liquidityPool.tokenPrice;
            this.setState({userStakedUsd: this.state.liquidityPool.userStakedUsd});
        }

        this.setState({
            poolTvl: this.state.liquidityPool.poolTvl,
            poolTvlUsd: this.state.liquidityPool.poolTvlUsd, 
            tokenPrice: this.state.liquidityPool.tokenPrice,
        });
    }

    initializeUserPoolData = async() => {
        await this.state.liquidityPool.initializeUserPoolData();
        this.setState({
            walletBalance: this.state.liquidityPool.walletBalance,
            userStaked: this.state.liquidityPool.userStaked,
            userStakedUsd: this.state.liquidityPool.userStakedUsd,
            userReward: this.state.liquidityPool.userReward,
            userRewardUsd: this.state.liquidityPool.userRewardUsd
        });
    }

    updateUserStakedAmount = async(_amount) => {
        await this.state.liquidityPool.updateUserStakedAmount(_amount);
        this.setState({
            walletBalance: this.state.liquidityPool.walletBalance,
            userStaked: this.state.liquidityPool.userStaked,
            userStakedUsd: this.state.liquidityPool.userStakedUsd,
        });
    }

    updateRewardAmount = async() => {
        await this.state.liquidityPool.updateUserReward();
        this.setState({userReward: this.state.liquidityPool.userReward, userRewardUsd: this.state.liquidityPool.userRewardUsd})
    }

    recomputeUserStakedUsdAmount = async() => {
        this.setState({
            userStakedUsd: this.state.liquidityPool.userStaked * this.state.tokenPrice,
        });
    }

    /**
     * Listen the Withdraw event to refresh Liquidity pool data
     */
    listenStakedAmountUpdatedEvent = async() => {

        let eventOptions = await this.state.liquidityPool.getEventOptions()
        let events = this.state.liquidityPool.getEvents();

        // When amount is unstaked, data should be refresh
        await events
        .StakedAmountUpdated(eventOptions)
        .on('data', async event => {
            
            // Refresh the user pool data only if the event is triggered by the user
            // and for this specific pool
            if(event.returnValues[0] === this.state.liquidityPool.account &&
               event.returnValues[1] === this.state.liquidityPool.address) {
                this.updateUserStakedAmount(RateConverter.convertToEth(event.returnValues[2]));  
            }

            // Refresh the pool TVL, even if the event isn't for this account
            await this.updateGlobalPoolData(true);
            // Refresh all pools data
            this.props.updateAllPoolsData();
            
        });
    }

    /**
     * Deposit the amount selected by the user - Triggered when user click on the deposit button
     */
    depositTokens = async (_amount) => {
        await this.state.liquidityPool.depositTokens(_amount);
    }

    /**
     * Withdraw the amount selected by the user - Triggered when user click on the withdraw button
     */
    withdrawTokens = async (_amount) => {
        await this.state.liquidityPool.withdrawTokens(_amount);
    }

    claimReward = async () => {
        await this.state.liquidityPool.claimReward();
    }

    render(){
        return(
            <div className='LiquidityPool'>
                <div className={this.state.cssLogoClass}>
                </div>
                <div className="PoolBaseInfo">
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='Daily reward' indicatorValue={this.state.dailyReward} indicatorUnit='%'/>
                </div>
                <div className="PoolStakedAmount">
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle={'1 ' + this.state.symbol + ':'} indicatorValue={this.state.tokenPrice} indicatorUnit='$'/>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='TVL' indicatorValue={this.state.poolTvl} indicatorUnit={this.state.symbol}/>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='TVL $' indicatorValue={this.state.poolTvlUsd.toFixed(2)} indicatorUnit='$'/>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='User staked' indicatorValue={this.state.userStaked} indicatorUnit={this.state.symbol}/>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='User staked $' indicatorValue={this.state.userStakedUsd.toFixed(2)} indicatorUnit='$'/>
                </div>
                <WithdrawDepositTabs>
                    <div label='Deposit'>
                        <Deposit walletBalance={this.state.walletBalance} depositTokens={this.depositTokens} symbol={this.state.symbol}/>
                    </div>
                    <div label='Withdraw'>
                        <Withdraw userStaked={this.state.userStaked} withdrawTokens={this.withdrawTokens} symbol={this.state.symbol}/>
                    </div>
                </WithdrawDepositTabs>
                <div className='RewardContent'>
                    <div className='RewardPoolTitle'>
                        <h3>Reward</h3>
                    </div>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='Reward HWT' indicatorValue={this.state.userReward.toFixed(2)} indicatorUnit='HWT'/>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='Reward Value' indicatorValue={this.state.userRewardUsd.toFixed(2)} indicatorUnit='USD'/>
                    <div className='ClaimRewardButton' onClick={this.claimReward}>Claim Reward</div>
                </div>
            </div>
        )
    }
}