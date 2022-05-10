import { balance } from '@openzeppelin/test-helpers';
import React from 'react';
import DataContainer from "./DataContainer.js";

export default class DepositWithdraw extends React.Component {

    state = {balance: 0, value: 50, depositAmount: 0};


    constructor(props) {
        super(props);
    }

    componentDidMount = async () => {
        let accountBalance = await this.props.tokenContract.getBalance();
        let amount = accountBalance * (this.state.value / 100);
        this.setState({balance: accountBalance, depositAmount: amount});
    }

    computeTokenAmount = (event) => {
        let computeAmount = Number.parseFloat(this.state.balance * (event.target.value / 100)).toFixed(4);
        this.state.value = event.target.value;
        this.setState({depositAmount: computeAmount, value: event.target.value});
    }

    WithdrawAmount = async () => {
        await this.props.tokenContract.approve(this.props.contract.address, this.state.value);
        await this.props.contract.stake(this.state.value);
    }

    render(){
        return(
            <div className='DepositWithdraw'>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Pool balance : ' indicatorValue={this.state.balance} indicatorUnit='HWT'/>
                <div className='SliderSelector'>
                    0%
                    <input type="range" min="0" max="100" step="0.01" value={this.state.value} onChange={this.computeTokenAmount}></input>
                    100%
                </div>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Withdrawal : ' indicatorValue={this.state.depositAmount} indicatorUnit='HWT'/>
                <div className='DepositWithdrawButton' onClick={this.WithdrawAmount}>Withdraw</div>
            </div>
        )
    }
}