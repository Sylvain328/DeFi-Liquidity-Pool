import TokenRequester from "../web3/tokenRequester.js";

export default class PoolManager {

    constructor(_tokenInstance, _symbol, _rewardPerSecond, _account) {
        
        this.tokenAddress = _tokenInstance._address;
        this.symbol = _symbol;
        this.rewardPerSecond = _rewardPerSecond;
        this.tokenRequester = new TokenRequester(_tokenInstance, _account);
    }
}