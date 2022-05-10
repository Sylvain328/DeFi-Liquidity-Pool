import React from 'react';
import Tabs from "./Tabs.js";
import Deposit from "./Deposit.js";
import Withdraw from "./Withdraw.js";
import DataContainer from "./DataContainer.js";
import RateConverter from "../utils/rateConverter.js";

export default class LiquidityPool extends React.Component {

    constructor(props) {
        super(props);
    }
    
    componentDidMount = async () => {
    }

    render(){
        return(
            <div className='LiquidityPool'>
                <div className='TokenPool'>
                    <h3>HWT</h3>
                </div>
                <div className="PoolBaseInfo">
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='Daily reward' indicatorValue='8' indicatorUnit='%'/>
                </div>
                <Tabs>
                    <div label='Deposit'>
                        <Deposit contract={this.props.contract} tokenContract={this.props.tokenContract} />
                    </div>
                    <div label='Withdraw'>
                        <Withdraw tokenContract={this.props.tokenContract} />
                    </div>
                </Tabs>
                <div className='RewardContent'>
                    <div className='RewardPoolTitle'>
                        <h3>Reward</h3>
                    </div>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='Reward HWT' indicatorValue='8' indicatorUnit='%'/>
                    <DataContainer containerClass='PoolDataContainer' indicatorTitle='Reward Value' indicatorValue='8' indicatorUnit='%'/>
                    <div className='ClaimRewardButton'>Claim Reward</div>
                </div>
            </div>
        )
    }
}