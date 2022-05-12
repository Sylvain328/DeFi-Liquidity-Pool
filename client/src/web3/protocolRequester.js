import RateConverter from "../utils/rateConverter.js";

export default class ProtocolRequester {

    constructor(_contract, _account) {
        this.contract = _contract;
        this.account = _account;
    }

    /** Get the reward Amount of the HWT Token Price */
    getHwtTokenUsdValue = async() => {
        return RateConverter.convertToEth(await this.contract.methods.hwtTokenUsdValue().call());
    }

    /** Get the TVL on the contract */
    totalValueLocked = async() => {
        return RateConverter.convertToEth(await this.contract.methods.totalValueLocked().call());
    }

    /** Stake token in account */
    stake = async(_amount) => {
        return await this.contract.methods.stake(RateConverter.convertToWei(_amount)).send({from: this.account});
    }

    /** Unstake token in account */
    unstake = async(_amount) => {
        await this.contract.methods.unstake(RateConverter.convertToWei(_amount)).send({from: this.account});
    }

    /** Get staked amount in the pool */
    getPoolStakedAmount = async() => {
        return RateConverter.convertToEth(await this.contract.methods.getStakedAmount().call({from: this.account}));
    }

    /** Get the reward amount */
    getRewardAmount = async() => {
        return RateConverter.convertToEth(await this.contract.methods.getRewardAmount().call({from: this.account}));
    }

    /** Claim the reward from the pool */
    claimPoolReward = async() => {
        await this.contract.methods.claimReward().send({from: this.account});
    }
}