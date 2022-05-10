const BigNumber = require('bignumber.js');

export default class ProtocolRequester {

    constructor(_contract, _account) {
        this.contract = _contract;
        this.account = _account;
    }

    /** Get the reward Amount of the HWT Token Price */
    getHwtTokenUsdValue = async() => {
        return await this.contract.methods.hwtTokenUsdValue().call();
    }

    /** Get the TVL on the contract */
    totalValueLocked = async() => {
        return await this.contract.methods.totalValueLocked().call();
    }

    /** Stake token in account */
    stake = async(_amount) => {
        return await this.contract.methods.stake(BigNumber(_amount).multipliedBy(1e18)).send({from: this.account});
    }
}