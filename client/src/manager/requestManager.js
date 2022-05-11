
import ProtocolRequester from "../web3/protocolRequester.js";
import TokenRequester from "../web3/tokenRequester.js";

export default class RequestManager {
    
    constructor(_protocolInstance, _tokenInstance, _account) {
        
        this.protocolInstance = _protocolInstance;
        this.protocolRequester = new ProtocolRequester(_protocolInstance, _account);
        this.tokenRequester = new TokenRequester(_tokenInstance, _account);
        this.account = _account;
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
        debugger;
        return this.protocolInstance;
    }

    getBaseEventOptions = () => {

        let options = {
            filter: {
                value: [],
            },
            fromBlock: 0
        };

        return options;
    }
}