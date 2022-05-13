import RateConverter from "../utils/rateConverter.js";

export default class TokenRequester {

    constructor(_token, _account) {
        this.token = _token;
        this.account = _account;
    }

    /** Get the token balance for the connected account */
    getBalance = async() => {
        return RateConverter.convertToEth(await this.token.methods.balanceOf(this.account).call());
    }

    /** Approve the transaction on the token constract */
    approve = async(_contractAddress, _valueToStake) => {
        console.log(process.versions)
        return await this.token.methods.approve(_contractAddress, RateConverter.convertToWei(_valueToStake)).send({from: this.account});
    }

    getTokenSymbol = async() => {
        return await this.token.methods.symbol().call();
    }
}