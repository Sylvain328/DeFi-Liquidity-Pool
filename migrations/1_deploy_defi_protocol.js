var DeFiProtocol = artifacts.require("./DeFiProtocol.sol");

module.exports = function(deployer) {
  deployer.deploy(DeFiProtocol);
};