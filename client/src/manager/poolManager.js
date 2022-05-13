import LiquidityPool from "../models/liquidityPool.js";

export default class PoolManager {

    constructor(_protocolRequester) {

        this.protocolRequester = _protocolRequester;
        this.pools = {};
        this.allPoolsTvl = 0;
        this.allPoolsUserStakedUsd = 0;
        this.allPoolsReward = 0;
        this.allPoolsRewardUsd = 0;
    }

    addNewPool = async (_id, _tokenInstance, _account, _isFakeToken, _basePrice, _cssLogoClass) => {

        const pool = new LiquidityPool(this.protocolRequester, _tokenInstance, _account, _isFakeToken, _basePrice, _cssLogoClass);
        await pool.initialize();

        this.pools[_id] = pool;
    }

    recomputeAllGeneralData = () => {

        let tvl = 0;
        let userUsdAmount = 0;
        let userReward = 0;
        let userRewardUsd = 0;

        for (var pool in this.pools) {
            tvl += this.pools[pool].poolTvl * this.pools[pool].tokenPrice;
            userUsdAmount += this.pools[pool].userStakedUsd;
            userReward += this.pools[pool].userReward;
            userRewardUsd += this.pools[pool].userRewardUsd;
        };

        this.allPoolsTvl = tvl;
        this.allPoolsUserStakedUsd = userUsdAmount;
        this.allPoolsUserReward = userReward;
        this.allPoolsUserRewardUsd = userRewardUsd;
    }
}