import React from 'react';
import Tabs from "./Tabs.js";
import Deposit from "./Deposit.js";
import Withdraw from "./Withdraw.js";
import DataContainer from "./DataContainer.js";
import RateConverter from "../utils/rateConverter.js";

export default class LiquidityPool extends React.Component {

    state = {stakedUsdAmount: 0, rewardHwdAmount: 0, rewardUsdAmount: 0}

    constructor(props) {
        super(props);
    }
    
    componentDidMount = async() => {

        let tokenPrice = await this.props.requestManager.getHwtTokenUsdValue();

        // Compute the total value staked by user in USD
        let newStakedAmount = await this.props.requestManager.getAllPoolsTvl();
        let newStakedAmountUsd = newStakedAmount * tokenPrice;

        // Compute the total reward in USD for the user
        let rewardHwtAmount = await this.props.requestManager.getPoolRewardAmount();
        let newRewardAmountPrice = rewardHwtAmount * tokenPrice;

        this.setState({stakedUsdAmount: newStakedAmountUsd.toFixed(4), rewardHwdAmount: rewardHwtAmount.toFixed(4), rewardUsdAmount: newRewardAmountPrice.toFixed(4)});
    }
    
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
                <Tabs>
                    <div label='Deposit'>
                        <Deposit requestManager={this.props.requestManager} />
                    </div>
                    <div label='Withdraw'>
                        <Withdraw requestManager={this.props.requestManager} />
                    </div>
                </Tabs>
                <div className='RewardContent'>
                    <div className='RewardPoolTitle'>
                        <h3>Reward</h3>
                    </div>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='Reward HWT' indicatorValue={this.state.rewardHwdAmount} indicatorUnit='HWT'/>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='Reward Value' indicatorValue={this.state.rewardUsdAmount} indicatorUnit='USD'/>
                    <div className='ClaimRewardButton' onClick={this.claimReward}>Claim Reward</div>
                </div>
            </div>
        )
    }
}