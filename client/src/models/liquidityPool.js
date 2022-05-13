import TokenRequester from "../web3/tokenRequester.js";

export default class LiquidityPool {

    constructor(_requestManager, _tokenInstance, _account, _isFakeToken, _basePrice, _cssLogoClass) {
        
        this.requestManager = _requestManager;
        this.address = _tokenInstance._address;
        this.tokenRequester = new TokenRequester(_tokenInstance, _account);
        this.isFakeToken = _isFakeToken;
        this.basePrice = _basePrice;
        this.account = _account;
        this.cssLogoClass = _cssLogoClass;
    }

    initialize = async() => {
        // Fixed data
        this.symbol = await this.tokenRequester.getTokenSymbol();
        const r = await this.requestManager.getPoolRewardPerSecond(this.address);
        this.dailyReward = Math.round(r * 86400);
        await this.refreshGlobalPoolData();
        await this.initializeUserPoolData();
    }

    refreshGlobalPoolData = async() => {
        this.poolTvl = await this.requestManager.getSinglePoolTvl(this.address);
        this.tokenPrice = await this.getTokenPrice();
        this.poolTvlUsd = this.poolTvl * this.tokenPrice;
    }

    initializeUserPoolData = async() => {
        this.userStaked = await this.requestManager.getPoolStakedAmount(this.address);
        this.userStakedUsd = this.userStaked * this.tokenPrice;
        this.walletBalance = await this.tokenRequester.getBalance();
        await this.updateUserReward();
    }

    updateUserStakedAmount = async(_amount) => {
        this.userStaked = _amount;
        this.walletBalance = await this.tokenRequester.getBalance();
    }

    updateUserReward = async() => {
        this.userReward = await this.requestManager.getPoolRewardAmount(this.address);
        this.userRewardUsd = await this.userReward * this.tokenPrice;
    }

    getTokenPrice =  async() => {
        return (this.tokenPrice = this.isFakeToken ? this.basePrice : await this.requestManager.getTokenPrice(this.address));
    }

    /**
     * Deposit the amount selected by the user - Triggered when user click on the deposit button
     */
    depositTokens = async (_depositAmount) => {
        await this.tokenRequester.approve(this.requestManager.protocolRequester.contract._address, _depositAmount); 
        await this.requestManager.deposit(this.address, _depositAmount);
    }

    /**
     * Withdraw the amount selected by the user - Triggered when user click on the withdraw button
     */
    withdrawTokens = async (_amount) => {
        await this.requestManager.withdraw(this.address, _amount);
    }

    /**
     * Claim the user reward on the pool - Triggered when the user click on the "claim reward" button
     */
    claimReward = async() => {
        await this.requestManager.claimPoolReward(this.address);
    }

    getEvents = () => {
        return this.requestManager.getProtocolEvents();
    }

    getEventOptions = async() => {
        return await this.requestManager.getBaseEventOptions();
    }
}