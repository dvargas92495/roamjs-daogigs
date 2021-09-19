const BountyFactory = artifacts.require("./BountyFactory.sol");
const Bounty = artifacts.require("./Bounty.sol");

contract("BountyFactory", ([deployer, source, hunter]) => {
  let factory;

  before(async () => {
    factory = await BountyFactory.deployed();
  });

  describe("bounties", async () => {
    it("deploys successfully", async () => {
      const address = await factory.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("creates bounties", async () => {
      const value = web3.utils.toWei("1", "ether");
      const result = await factory.deploy({
        from: source,
        value,
      });
      const bountyCount = await factory.bountyCount();
      assert.equal(bountyCount, 1);
      const event = result.logs[0].args;
      const id = event.id.toNumber();
      assert.equal(id, bountyCount - 1, "id is correct");

      const bounty = await factory.bounties(id);
      assert.notEqual(bounty, 0x0);
      const amount = await Bounty.at(bounty).then((b) => b.sources(source));
      assert.equal(amount, value);
    });
  });
});
