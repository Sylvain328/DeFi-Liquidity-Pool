import React from 'react';
import RateConverter from "../utils/rateConverter.js";
import DataContainer from './DataContainer.js';

export default class GeneralData extends React.Component {

    state = {stakedUsdAmount: 0, rewardHwdAmount: 0, rewardUsdAmount: 0}

    constructor(props) {
        super(props);
    }
    
    componentDidMount = async () => {

        let tokenPrice = await this.props.requestManager.getHwtTokenUsdValue();

        // Compute the total value staked by user in USD
        let newStakedAmount = await this.props.requestManager.getAllPoolsTvl();
        let newStakedAmountUsd = newStakedAmount * tokenPrice;

        // Compute the total reward in USD for the user
        let rewardHwtAmount = await this.props.requestManager.getPoolRewardAmount();
        let newRewardAmountPrice = rewardHwtAmount * tokenPrice;

        this.setState({stakedUsdAmount: newStakedAmountUsd, rewardHwdAmount: rewardHwtAmount, rewardUsdAmount: newRewardAmountPrice});
    }

    render(){
        return(
            <div className="UserData">
                <h3>User</h3>
                <DataContainer containerClass='DataContainer' indicatorTitle='Total Staked Amount' indicatorValue={this.state.stakedUsdAmount} indicatorUnit='USD'/>
                <DataContainer containerClass='DataContainer' indicatorTitle='Total Reward HWT' indicatorValue={this.state.rewardHwdAmount} indicatorUnit='HWT'/>
                <DataContainer containerClass='DataContainer' indicatorTitle='Total Reward Amount' indicatorValue={this.state.rewardUsdAmount} indicatorUnit='USD'/>
            </div>
        )
    }
}