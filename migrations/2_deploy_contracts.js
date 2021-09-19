const BountyFactory = artifacts.require("BountyFactory");

module.exports = function(deployer) {
  deployer.deploy(BountyFactory);
};
