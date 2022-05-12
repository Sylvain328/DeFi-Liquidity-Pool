
import ProtocolRequester from "../web3/protocolRequester.js";

export default class RequestManager {
    
    constructor(_protocolInstance, _poolManagers, _account, _getBlockNumber) {
        
        this.protocolInstance = _protocolInstance;
        this.protocolRequester = new ProtocolRequester(_protocolInstance, _account);
        this.poolManagers = _poolManagers;
        this.account = _account;
        this.getBlockNumber = _getBlockNumber;
    }

    getHwtTokenUsdValue = async(_address) => {
        return await this.protocolRequester.getHwtTokenUsdValue(_address);
    }

    // getAllPoolsTvl = async(_address) => {
    //     return await this.protocolRequester.getTotalValueLocked()
    // }

    getSinglePoolTvl = async(_address) => {
        return await this.protocolRequester.getTotalValueLocked(_address);
    }

    deposit = async(_tokenId, _address, _depositAmount) => {

        await this.poolManagers[_tokenId].tokenRequester.approve(this.protocolRequester.contract._address, _depositAmount); 
        await this.protocolRequester.stake(_address, _depositAmount);
    }

    withdraw = async(_address, _withdrawAmount) => {
        await this.protocolRequester.unstake(_address, _withdrawAmount);
    }

    getPoolStakedAmount = async(_address) => {
        return await this.protocolRequester.getPoolStakedAmount(_address);
    }

    getTokenBalance = async(_tokenId) => {
        return await this.poolManagers[_tokenId].tokenRequester.getBalance();
    }

    getPoolRewardAmount = async(_address) => {
        return await this.protocolRequester.getRewardAmount(_address);
    }

    claimPoolReward = async(_address) => {
        await this.protocolRequester.claimPoolReward(_address);
    }

    getProtocolEvents = () => {
        return this.protocolInstance;
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