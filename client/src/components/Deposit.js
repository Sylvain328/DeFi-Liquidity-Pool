import React from 'react';
import DataContainer from "./DataContainer.js";

export default class DepositWithdraw extends React.Component {

    state = { sliderValue: 50, depositAmount: 0, isButtonLocked: false };

    componentDidMount = async () => {
        // Set the balance and initialize the slider
        this.setState({walletBalance: this.props.walletBalance, buttonClass: ""});
        this.recomputeTokenToDeposit(this.state.sliderValue);
    }

    componentDidUpdate(prevProps, prevState) {
        // If an external event update the walletBalance, the tokenToDeposit Amount have to be recomputed
        if (prevProps.walletBalance !== this.props.walletBalance) {
            this.recomputeTokenToDeposit(this.state.sliderValue);
        }
    }

    /**
     * Compute the token to deposit - Triggered when the user move the slider
     */
    computeTokenAmount = (event) => {
        this.recomputeTokenToDeposit(event.target.value);
    }

    /**
     * Compute the token to deposite
     */
    recomputeTokenToDeposit= (_sliderValue) => {
        let computeAmount = Number.parseFloat(this.props.walletBalance * (_sliderValue / 100));
        this.setState({depositAmount: computeAmount, sliderValue: _sliderValue});
    }

    /**
     * Call the deposit method - Triggered when the user click on the deposit button
     */
    depositTokens = async () => {
        await this.props.depositTokens(this.state.depositAmount);     
    }

    clickTest = () => {
        this.setState({isButtonLocked: true, buttonClass: 'Button-loading'})
    }

    render(){
        return(
            <div className='DepositWithdraw'>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Wallet balance : ' indicatorValue={this.props.walletBalance} indicatorUnit={this.props.symbol}/>
                <div className='SliderSelector'>
                    0%
                    <input type="range" min="0" max="100" step="0.0001" value={this.state.sliderValue} onChange={this.computeTokenAmount}></input>
                    100%
                </div>
                <DataContainer containerClass='PoolDataContainer' indicatorTitle='Deposit : ' indicatorValue={this.state.depositAmount} indicatorUnit={this.props.symbol}/>
            
                <button type="Button" className={"Button " + this.props.buttonClass} disabled={this.state.isButtonLocked} onClick={this.depositTokens}>
                    <span className="ButtonText">Deposit</span>
                </button>
            </div>
        )
    }
}