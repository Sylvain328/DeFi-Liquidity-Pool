const BigNumber = require('bignumber.js');

export default class RateConverter {

    static convertToEth(_price) {
        return _price / 1e18;
    }

    static convertToWei(_price) {
        return BigNumber(_price * 1e18).toFixed();
    }

    static convertFromPriceFeed(_price) {
        return _price / 1e8;
    }
}