import TokenRequester from "../web3/tokenRequester.js";

export default class LiquidityPool {

    constructor(_protocolRequester, _tokenInstance, _account, _isFakeToken, _basePrice, _cssLogoClass) {
        
        this.protocolRequester = _protocolRequester;
        this.address = _tokenInstance._address;
        this.tokenRequester = new TokenRequester(_tokenInstance, _account);
        this.isFakeToken = _isFakeToken;
        this.basePrice = _basePrice;
        this.account = _account;
        this.cssLogoClass = _cssLogoClass;
    }

    /**
     * Initialize Liquidity ppol Data
     */
    initialize = async() => {
        // Fixed data
        this.symbol = await this.tokenRequester.getTokenSymbol();
        const r = await this.protocolRequester.getPoolRewardPerSecond(this.address);
        this.dailyReward = Math.round(r * 86400);
        await this.refreshGlobalPoolData();
        await this.initializeUserPoolData();
    }

    /**
     * Refresh Global Data of the pool (Tvl, tokenPrice, etc...)
     */
    refreshGlobalPoolData = async() => {
        this.poolTvl = await this.protocolRequester.getTotalValueLocked(this.address);
        this.tokenPrice = await this.getTokenPrice();
        this.poolTvlUsd = this.poolTvl * this.tokenPrice;
    }

    /**
     * Initialize user data of the liquidity pool
     */
    initializeUserPoolData = async() => {
        this.userStaked = await this.protocolRequester.getPoolStakedAmount(this.address);
        this.userStakedUsd = this.userStaked * this.tokenPrice;
        this.walletBalance = await this.tokenRequester.getBalance();
        await this.updateUserReward();
    }

    /**
     * Update the user staked amount on the liquidity pool and refresh the balance
     * Update also the user balance
     */
    updateUserStakedAmount = async(_amount) => {
        this.userStaked = _amount;
        this.userStakedUsd = this.userStaked * this.tokenPrice;
        this.walletBalance = await this.tokenRequester.getBalance();
    }

    /**
     * Update the user reward from the pool
     */
    updateUserReward = async() => {
        this.userReward = await this.protocolRequester.getRewardAmount(this.address);
        this.userRewardUsd = await this.userReward * this.tokenPrice;
        return this.userReward;
    }

    /**
     * Get the token price, it will be refresh only if the token is real
     */
    getTokenPrice =  async() => {
        return (this.tokenPrice = this.isFakeToken ? this.basePrice : await this.protocolRequester.getTokenPrice(this.address));
    }

    /**
     * Deposit the amount selected by the user - Triggered when user click on the deposit button
     */
    depositTokens = async (_depositAmount) => {
        await this.tokenRequester.approve(this.protocolRequester.contract._address, _depositAmount); 
        await this.protocolRequester.stake(this.address, _depositAmount);
    }

    /**
     * Withdraw the amount selected by the user - Triggered when user click on the withdraw button
     */
    withdrawTokens = async (_amount) => {
        await this.protocolRequester.unstake(this.address, _amount);
    }

    /**
     * Claim the user reward on the pool - Triggered when the user click on the "claim reward" button
     */
    claimReward = async() => {
        await this.protocolRequester.claimPoolReward(this.address);
    }

    /**
     * Get the events of the protocol contract
     */
    getEvents = () => {
        return this.protocolRequester.getProtocolEvents();
    }

    /**
     * Get the base event option
     */
    getEventOptions = async() => {
        return await this.protocolRequester.getBaseEventOptions();
    }
}