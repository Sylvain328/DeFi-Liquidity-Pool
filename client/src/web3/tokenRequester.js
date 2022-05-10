const BigNumber = require('bignumber.js');

export default class TokenRequester {

    constructor(_token, _account) {
        this.token = _token;
        this.account = _account;
    }

    /** Get the hwt balance for the connected account */
    getBalance = async() => {
        return await this.token.methods.balanceOf(this.account).call() / 1e18;
    }

    /** Approve the transaction on the token constract */
    approve = async(_contractAddress, _valueToStake) => {
        console.log(process.versions)
        return await this.token.methods.approve(_contractAddress, BigNumber(_valueToStake).multipliedBy(1e18)).send({from: this.account});
    }
}