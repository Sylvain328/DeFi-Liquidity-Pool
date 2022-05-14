var DeFiProtocol = artifacts.require("./DeFiProtocol.sol");
var HWT = artifacts.require("./HWT.sol");
var GUM = artifacts.require("./GUM.sol");

module.exports = function(deployer, network, accounts) {

  deployer.then(async () => {
    await deployer.deploy(HWT);
    await deployer.deploy(GUM);
    await deployer.deploy(DeFiProtocol, HWT.address);

    const hwtTokenInstance = await HWT.deployed();
    const gumTokenInstance = await GUM.deployed();
    const DeFiProtocolInstance = await DeFiProtocol.deployed();

    // Send big HWT amount to the protocol contract
    await hwtTokenInstance.transfer(DeFiProtocolInstance.address, BigInt(999999000000000000000000000), {from: accounts[0]});

    // Create liquidity pools
    // hwt token
    await DeFiProtocolInstance.createLiquidityPool(hwtTokenInstance.address, hwtTokenInstance.address, 925925925259, {from: accounts[0]});

    // gum token
    await DeFiProtocolInstance.createLiquidityPool(gumTokenInstance.address, gumTokenInstance.address, 578703703703, {from: accounts[0]});

    // link token - with chainlink feed address for price
    await DeFiProtocolInstance.createLiquidityPool('0xa36085F69e2889c224210F603D836748e7dC0088', '0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0', 34722222222222, {from: accounts[0]});
  });
};