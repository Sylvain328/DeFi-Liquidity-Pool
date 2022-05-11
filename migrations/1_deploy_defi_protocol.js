var DeFiProtocol = artifacts.require("./DeFiProtocol.sol");
var HWT = artifacts.require("./HWT.sol");

module.exports = function(deployer) {

  deployer.then(async () => {
    await deployer.deploy(HWT);
    await deployer.deploy(DeFiProtocol, HWT.address);
  });
};