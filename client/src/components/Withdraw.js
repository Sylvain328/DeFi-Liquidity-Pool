import React from 'react';
import DataContainer from "./DataContainer.js";

export default class DepositWithdraw extends React.Component {

    state = {sliderValue: 50, withdrawAmount: 0};

    componentDidMount = async () => {
        // Set the balance and initialize the slider
        this.setState({userStaked: this.props.userStaked});
        this.recomputeTokenToWithdraw(this.state.sliderValue);
    }

    componentDidUpdate(prevProps, prevState) {
        // If an external event update the walletBalance, the tokenToDeposit Amount have to be recomputed
        if (prevProps.userStaked !== this.props.userStaked) {
            this.recomputeTokenToWithdraw(this.state.sliderValue);
        }
    }


    computeTokenToWithdraw = (event) => {
        this.recomputeTokenToWithdraw(event.target.value);
    }

    recomputeTokenToWithdraw = (_sliderValue) => {
        let withdrawAmount = Number.parseFloat(this.props.userStaked * (_sliderValue/ 100)).toFixed(4);
        this.setState({withdrawAmount: withdrawAmount, sliderValue: _sliderValue});
    }

    withdrawTokens = async () => {
        await this.props.withdrawTokens(this.state.withdrawAmount);
    }

    render(){
        return(
            <div className='DepositWithdraw'>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Staked Amount : ' indicatorValue={this.props.userStaked} indicatorUnit='HWT'/>
                <div className='SliderSelector'>
                    0%
                    <input type="range" min="0" max="100" step="0.01" value={this.state.sliderValue} onChange={this.computeTokenToWithdraw}></input>
                    100%
                </div>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Withdrawal : ' indicatorValue={this.state.withdrawAmount} indicatorUnit='HWT'/>
                <div className='DepositWithdrawButton' onClick={this.withdrawTokens}>Withdraw</div>
            </div>
        )
    }
}