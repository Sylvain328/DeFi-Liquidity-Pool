
import ProtocolRequester from "../web3/protocolRequester.js";

export default class RequestManager {
    
    constructor(_protocolInstance, _account, _getBlockNumber) {
        
        this.protocolInstance = _protocolInstance;
        this.protocolRequester = new ProtocolRequester(_protocolInstance, _account);
        this.account = _account;
        this.getBlockNumber = _getBlockNumber;
    }

    getHwtTokenUsdValue = async() => {
        return await this.protocolRequester.getHwtTokenUsdValue();
    }

    getFlpTokenUsdValue = async() => {
        return await this.protocolRequester.getFlpTokenUsdValue();
    }

    getTokenPrice = async(_address) => {
        return await this.protocolRequester.getTokenPrice(_address);
    }

    getSinglePoolTvl = async(_address) => {
        return await this.protocolRequester.getTotalValueLocked(_address);
    }

    deposit = async(_address, _depositAmount) => {
        await this.protocolRequester.stake(_address, _depositAmount);
    }

    withdraw = async(_address, _withdrawAmount) => {
        await this.protocolRequester.unstake(_address, _withdrawAmount);
    }

    getPoolStakedAmount = async(_address) => {
        return await this.protocolRequester.getPoolStakedAmount(_address);
    }

    getPoolRewardAmount = async(_address) => {
        return await this.protocolRequester.getRewardAmount(_address);
    }

    claimPoolReward = async(_address) => {
        await this.protocolRequester.claimPoolReward(_address);
    }

    getPoolRewardPerSecond = async(_address) => {
        return await this.protocolRequester.getPoolRewardPerSecond(_address);
    }

    getProtocolEvents = () => {
        return this.protocolInstance.events;
    }

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