import React from 'react';
import DataContainer from "./DataContainer.js";

export default class DepositWithdraw extends React.Component {

    state = {sliderValue: 50, withdrawAmount: 0, isButtonLocked: false};

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

        // State of the button, to activate or disable it
        if(this.props.userStaked === 0&& !this.state.isButtonLocked) {
            this.setState({isButtonLocked: true});
        }
        else if(this.props.userStaked > 0 && this.state.isButtonLocked) {
            this.setState({isButtonLocked: false});
        } 
    }

    computeTokenToWithdraw = (event) => {

        let computedAmount = this.recomputeTokenToWithdraw(event.target.value);

        // State of the button, to activate or disable it
        if(computedAmount === 0 && !this.state.isButtonLocked) {
            this.setState({isButtonLocked: true});
        }
        else if(computedAmount > 0 && this.state.isButtonLocked) {
            this.setState({isButtonLocked: false});
        } 
    }

    recomputeTokenToWithdraw = (_sliderValue) => {
        let withdrawAmount = Number.parseFloat(this.props.userStaked * (_sliderValue/ 100));
        this.setState({withdrawAmount: withdrawAmount, sliderValue: _sliderValue});
        return withdrawAmount;
    }

    withdrawTokens = async () => {
        await this.props.withdrawTokens(this.state.withdrawAmount);
    }

    render(){
        return(
            <div className='DepositWithdraw'>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Staked Amount : ' indicatorValue={this.props.userStaked} indicatorUnit={this.props.symbol}/>
                <div className='SliderSelector'>
                    0%
                    <input type="range" min="0" max="100" step="0.0001" value={this.state.sliderValue} onChange={this.computeTokenToWithdraw}></input>
                    100%
                </div>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Withdrawal : ' indicatorValue={this.state.withdrawAmount} indicatorUnit={this.props.symbol}/>

                <button type="Button" className={"Button " + this.props.buttonClass} disabled={this.state.isButtonLocked} onClick={this.withdrawTokens}>
                    <span className="ButtonText">Withdraw</span>
                </button>
            </div>
        )
    }
}