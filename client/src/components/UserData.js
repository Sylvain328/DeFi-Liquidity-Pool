import React from 'react';
import DataContainer from './DataContainer.js';
import RateConverter from "../utils/rateConverter.js";

export default class GeneralData extends React.Component {

    state = {tokenPrice: 0, userStakedUsd: 0, userReward: 0, userRewardUsd: 0}

    componentDidMount = async () => {

        this.state.tokenPrice = await this.props.requestManager.getHwtTokenUsdValue();

        await this.listenWithdrawEvent();
        await this.listenDepositEvent();

        // Compute the total value staked by user in USD and the reward amount
        await this.computeUserStaked();
        await this.computeUserReward();

        // Create a refresh interval for the reward amount
        this.refreshRewardInterval = setInterval(async () => await this.computeUserReward(), 5000);  
    }

    componentWillUnmount = async() => {
        // Clear the interval when component is unmounted to avoir an error
        clearInterval(this.refreshRewardInterval);
    }

    /**
     * Compute the amount and setState the user stakedAmount and stakedAmount in Usd of the pool
     */
     computeUserStaked = async() => {
        
        let userStaked = 0//await this.props.requestManager.getPoolStakedAmount();
        let userStakedUsd = userStaked * this.state.tokenPrice;
        this.setState({ userStakedUsd: userStakedUsd.toFixed(4) }); 
    }

    /**
     * Compute the reward and setState the user reward and user reward in Usd of the pool
     */
    computeUserReward = async() => {

        let userReward =0// await this.props.requestManager.getPoolRewardAmount();
        let userRewardUsd = userReward * this.state.tokenPrice;
        this.setState({ userReward: userReward.toFixed(4), userRewardUsd: userRewardUsd.toFixed(4) }); 
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
            
            // Refresh the user pool data only if the event is triggered by the user
            if(event.returnValues[0] === this.props.requestManager.account) {
                let stakedAmount = RateConverter.convertToEth(event.returnValues[1]);
                let stakedAmountUsd = stakedAmount * this.state.tokenPrice;
                this.setState({userStakedUsd : stakedAmountUsd});
                await this.computeUserReward();
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

            // Run the refresh only if the event comes from the connected account
            if(event.returnValues[0] === this.props.requestManager.account) {
                let stakedAmount = RateConverter.convertToEth(event.returnValues[1]);
                let stakedAmountUsd = stakedAmount * this.state.tokenPrice;
                this.setState({userStakedUsd : stakedAmountUsd});
                await this.computeUserReward();
            }
        });
    }

    render(){
        return(
            <div className="UserData">
                <h3>User</h3>
                <DataContainer containerClass='DataContainer' indicatorTitle='Total Staked Amount' indicatorValue={this.state.userStakedUsd} indicatorUnit='USD'/>
                <DataContainer containerClass='DataContainer' indicatorTitle='Total Reward HWT' indicatorValue={this.state.userReward} indicatorUnit='HWT'/>
                <DataContainer containerClass='DataContainer' indicatorTitle='Total Reward Amount' indicatorValue={this.state.userRewardUsd} indicatorUnit='USD'/>
            </div>
        )
    }
}