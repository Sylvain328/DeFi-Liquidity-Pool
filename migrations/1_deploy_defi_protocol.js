var DeFiProtocol = artifacts.require("./DeFiProtocol.sol");
var HWT = artifacts.require("./HWT.sol");

module.exports = function(deployer) {
  deployer.deploy(HWT);
  deployer.deploy(DeFiProtocol);
};