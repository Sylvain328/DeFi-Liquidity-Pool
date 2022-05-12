var DeFiProtocol = artifacts.require("./DeFiProtocol.sol");
var HWT = artifacts.require("./HWT.sol");

module.exports = function(deployer, network, accounts) {

  deployer.then(async () => {
    await deployer.deploy(HWT);
    await deployer.deploy(DeFiProtocol, HWT.address);

    const tokenInstance = await HWT.deployed();
    const DeFiProtocolInstance = await DeFiProtocol.deployed();
    // Send big HWT amount to the protocol contract
    await tokenInstance.transfer(DeFiProtocolInstance.address, BigInt(999999000000000000000000000), {from: accounts[0]});
    await DeFiProtocolInstance.createLiquidityPool(tokenInstance.address, tokenInstance.address, 925925925925, {from: accounts[0]});
  });
};