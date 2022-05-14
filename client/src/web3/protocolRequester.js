import RateConverter from "../utils/rateConverter.js";

export default class ProtocolRequester {

    constructor(_contract, _account, _getBlockNumber) {
        this.contract = _contract;
        this.account = _account;
        this.getBlockNumber = _getBlockNumber;
    }

    /** Get the reward Amount of the HWT Token Price */
    getHwtTokenUsdValue = async() => {
        return RateConverter.convertToEth(await this.contract.methods.hwtTokenUsdValue().call());
    }

    /** Get the reward Amount of the HWT Token Price */
    getFlpTokenUsdValue = async() => {
        return RateConverter.convertToEth(await this.contract.methods.flpTokenUsdValue().call());
    }

    /** Get the TVL of a pool on the contract */
    getTotalValueLocked = async(_address) => {
        return RateConverter.convertToEth(await this.contract.methods.getTotalValueLocked(_address).call());
    }

    /** Stake token in account */
    stake = async(_address, _amount) => {
        return await this.contract.methods.stake(_address, RateConverter.convertToWei(_amount)).send({from: this.account});
    }

    /** Unstake token in account */
    unstake = async(_address, _amount) => {
        await this.contract.methods.unstake(_address, RateConverter.convertToWei(_amount)).send({from: this.account});
    }

    /** Get staked amount in the pool */
    getPoolStakedAmount = async(_address) => {
        return RateConverter.convertToEth(await this.contract.methods.getStakedAmount(_address).call({from: this.account}));
    }

    /** Get the reward amount of the pool */
    getRewardAmount = async(_address) => {
        return RateConverter.convertToEth(await this.contract.methods.getRewardAmount(_address).call({from: this.account}));
    }

    /** Claim the reward from the pool */
    claimPoolReward = async(_address) => {
        await this.contract.methods.claimReward(_address).send({from: this.account});
    }

    /** Get the pool reward per second in % */
    getPoolRewardPerSecond = async(_address) => {
        return RateConverter.convertToEth(await this.contract.methods.getRewardPerSecond(_address).call({from: this.account})) * 100;
    }

    /**
     * Get the Token price via Chainlink
     */
    getTokenPrice = async(_address) => {
        return RateConverter.convertFromPriceFeed(await this.contract.methods.getTokenPrice(_address).call());
    }

    /**
     * Get the contract events
     */
    getProtocolEvents = () => {
        return this.contract.events;
    }

    /**
     * Get the base options for events from last block
     */
    getBaseEventOptions = async() => {

        let options = {
            filter: {
                value: [],
            },
            fromBlock: await this.getBlockNumber()
        };

        return options;
    }
}