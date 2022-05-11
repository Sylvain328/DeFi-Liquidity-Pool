import { balance } from '@openzeppelin/test-helpers';
import React from 'react';
import DataContainer from "./DataContainer.js";

export default class DepositWithdraw extends React.Component {

    state = {stakedAmount: 0, value: 50, withdrawAmount: 0};


    constructor(props) {
        super(props);
    }

    componentDidMount = async () => {
        let stakedAmount = await this.props.requestManager.getPoolStakedAmount();
        let withdrawAmount = stakedAmount * (this.state.value / 100);
        this.setState({stakedAmount: stakedAmount, withdrawAmount: withdrawAmount});
    }

    computeTokenAmount = (event) => {
        let computeAmount = Number.parseFloat(this.state.stakedAmount * (event.target.value / 100)).toFixed(4);
        this.state.value = event.target.value;
        this.setState({withdrawAmount: computeAmount, value: event.target.value});
    }

    WithdrawAmount = async () => {
        await this.props.requestManager.withdraw(this.state.withdrawAmount);
    }

    render(){
        return(
            <div className='DepositWithdraw'>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Staked Amount : ' indicatorValue={this.state.stakedAmount} indicatorUnit='HWT'/>
                <div className='SliderSelector'>
                    0%
                    <input type="range" min="0" max="100" step="0.01" value={this.state.value} onChange={this.computeTokenAmount}></input>
                    100%
                </div>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Withdrawal : ' indicatorValue={this.state.withdrawAmount} indicatorUnit='HWT'/>
                <div className='DepositWithdrawButton' onClick={this.WithdrawAmount}>Withdraw</div>
            </div>
        )
    }
}