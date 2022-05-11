const BigNumber = require('bignumber.js');

export default class ProtocolRequester {

    constructor(_contract, _account) {
        this.contract = _contract;
        this.account = _account;
    }

    /** Get the reward Amount of the HWT Token Price */
    getHwtTokenUsdValue = async() => {
        return await this.contract.methods.hwtTokenUsdValue().call() / 1e18;
    }

    /** Get the TVL on the contract */
    totalValueLocked = async() => {
        return await this.contract.methods.totalValueLocked().call() / 1e18;
    }

    /** Stake token in account */
    stake = async(_amount) => {
        return await this.contract.methods.stake(BigNumber(_amount * 1e18).toFixed()).send({from: this.account});
    }

    /** Unstake token in account */
    unstake = async(_amount) => {
        await this.contract.methods.unstake(BigNumber(_amount * 1e18).toFixed()).send({from: this.account});
    }

    /** Get staked amount in the pool */
    getPoolStakedAmount = async() => {
        return await this.contract.methods.getStakedAmount().call({from: this.account}) / 1e18;
    }

    /** Get the reward amount */
    getRewardAmount = async() => {
        return await this.contract.methods.getRewardAmount().call({from: this.account}) / 1e18;
    }

    /** Claim the reward from the pool */
    claimPoolReward = async() => {
        await this.contract.methods.claimReward().send({from: this.account});
    }

    stakedEvent = async(_updateStateCallback) => {

        // Event options
        let options = {
            filter: {
                value: [],
            },
            fromBlock: 0
        };
      
        await this.contract.events.AmountStaked(options)
        .on('data', event => {

            if(event.returnValues[0] == this.account) {
                _updateStateCallback()
            }
        });
    }
}