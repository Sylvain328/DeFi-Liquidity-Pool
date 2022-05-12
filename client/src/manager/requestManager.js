
import ProtocolRequester from "../web3/protocolRequester.js";
import TokenRequester from "../web3/tokenRequester.js";

export default class RequestManager {
    
    constructor(_protocolInstance, _tokenInstance, _account, _getBlockNumber) {
        
        this.protocolInstance = _protocolInstance;
        this.protocolRequester = new ProtocolRequester(_protocolInstance, _account);
        this.tokenRequester = new TokenRequester(_tokenInstance, _account);
        this.account = _account;
        this.getBlockNumber = _getBlockNumber;
    }

    getHwtTokenUsdValue = async() => {
        return await this.protocolRequester.getHwtTokenUsdValue();
    }

    getAllPoolsTvl = async() => {
        return await this.protocolRequester.totalValueLocked()
    }

    getSinglePoolTvl = async() => {
        return await this.protocolRequester.totalValueLocked()
    }

    deposit = async(_depositAmount) => {

        await this.tokenRequester.approve(this.protocolRequester.contract._address, _depositAmount); 
        await this.protocolRequester.stake(_depositAmount);
    }

    withdraw = async(_withdrawAmount) => {
        await this.protocolRequester.unstake(_withdrawAmount);
    }

    getPoolStakedAmount = async() => {
        return await this.protocolRequester.getPoolStakedAmount();
    }

    getTokenBalance = async() => {
        return await this.tokenRequester.getBalance();
    }

    getPoolRewardAmount = async() => {
        return await this.protocolRequester.getRewardAmount();
    }

    claimPoolReward = async() => {
        await this.protocolRequester.claimPoolReward();
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