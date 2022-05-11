import { balance } from '@openzeppelin/test-helpers';
import React from 'react';
import DataContainer from "./DataContainer.js";

export default class DepositWithdraw extends React.Component {

    state = {balance: 0, value: 50, depositAmount: 0, isButtonLocked: false};


    constructor(props) {
        super(props);
    }

    componentDidMount = async () => {

        let requestManager = this.props.requestManager;

        let accountBalance = await this.props.requestManager.getTokenBalance();
        let amount = accountBalance * (this.state.value / 100);
        let isButtonLocked = this.state.value == 0;

        let instance = requestManager.getProtocolEvents();
        let eventOptions = requestManager.getBaseEventOptions();

        // // On the event, refresh the amounts
        await instance.events
        .AmountStaked(eventOptions)
        .on('data', event => {
            this.setState({balance: event.returnValues[0] / 1e18});
            //this.recomputeTokenToDeposit(this.state.value);
        });

        this.setState({balance: accountBalance, depositAmount: amount});
    }

    computeTokenAmount = (event) => {
        this.recomputeTokenToDeposit(event.target.value);
    }

    recomputeTokenToDeposit= (_sliderValue) => {
        let computeAmount = Number.parseFloat(this.state.balance * (_sliderValue / 100)).toFixed(4);
        this.state.value = _sliderValue;
        this.setState({depositAmount: computeAmount, value: _sliderValue});
    }

    depositAmount = async () => {
        await this.props.requestManager.deposit(this.state.depositAmount);
    }

    render(){
        return(
            <div className='DepositWithdraw'>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Wallet balance : ' indicatorValue={this.state.balance} indicatorUnit='HWT'/>
                <div className='SliderSelector'>
                    0%
                    <input type="range" min="0" max="100" step="0.01" value={this.state.value} onChange={this.computeTokenAmount}></input>
                    100%
                </div>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Deposit : ' indicatorValue={this.state.depositAmount} indicatorUnit='HWT'/>
                <div className='DepositWithdrawButton' onClick={this.depositAmount}>Deposit</div>
            </div>
        )
    }
}