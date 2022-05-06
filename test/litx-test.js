const { expect } = require("chai");
const { ethers } = require("hardhat");

const mine = async () => {
  await network.provider.send("evm_mine");
};

const future = async (secs) => {
  await network.provider.send("evm_increaseTime", [secs]);
  await mine();
};

describe("LITxToken", function () {
  let deployer;
  let user0;
  let user1;
  let bridge;
  let ecosystem;
  let feedistributor;
  let lithtoken;
  let litxtoken;
  let migrateBy;

  const period = 60 * 24 * 3600;
  const chains = [4, 97, 80001];

  beforeEach(async function () {
    [deployer, user0, user1, bridge, ecosystem, feedistributor] =
      await hre.ethers.getSigners();

    const LIThToken = await ethers.getContractFactory("LIThToken");
    lithtoken = await upgrades.deployProxy(LIThToken, ["LITh Token", "LITh"]);
    await lithtoken.deployed();

    now = Math.floor(Date.now() / 1000);
    migrateBy = now + period;

    const LITxToken = await ethers.getContractFactory("LITxToken");
    const args = [
      bridge.address,
      ecosystem.address,
      lithtoken.address,
      migrateBy,
      chains,
    ];
    litxtoken = await upgrades.deployProxy(LITxToken, args);
    await litxtoken.deployed();

    let rcpt = await (
      await litxtoken.setFeeDistributor(feedistributor.address)
    ).wait();
    expect(rcpt.status).to.equal(1);
  });

  describe("Should deploy LITxToken and check initial state", function () {
    it("check initial state", async function () {
      await expect(
        litxtoken.connect(bridge).setFeeDistributor(feedistributor.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await litxtoken.name()).to.equal("LITx Token");
      expect(await litxtoken.symbol()).to.equal("LITx");
      expect(await litxtoken.decimals()).to.equal(18);
      expect(await litxtoken.totalSupply()).to.equal(
        "5417770823000000000000000000"
      );
      expect(await litxtoken.bridge()).to.equal(bridge.address);
      expect(await litxtoken.ecosystem()).to.equal(ecosystem.address);
      expect(await litxtoken.migrateBy()).to.equal(migrateBy);
      expect(await litxtoken.chains(chains[0])).to.equal(true);
      expect(await litxtoken.chains(chains[1])).to.equal(true);
      expect(await litxtoken.chains(chains[2])).to.equal(true);
      expect(await litxtoken.chains(1)).to.equal(false);
      expect(await litxtoken.feeDistributor()).to.equal(feedistributor.address);
    });
  });

  describe("Should deploy LITxToken and bridge token", function () {
    it("bridge token", async function () {
      const amount = 1000000;
      let rcpt = await (
        await lithtoken.approve(litxtoken.address, amount)
      ).wait();
      expect(rcpt.status).to.equal(1);

      rcpt = await (await litxtoken.migrate(deployer.address, amount)).wait();
      expect(rcpt.status).to.equal(1);

      await expect(litxtoken.bridgeGetOn(amount, 5)).to.be.revertedWith(
        "LITX: bad chain"
      );

      let totalSupply = await litxtoken.totalSupply();

      rcpt = await (await litxtoken.bridgeGetOn(amount, 4)).wait();
      expect(rcpt.status).to.equal(1);
      expect(await litxtoken.totalSupply()).to.eq(totalSupply.sub(amount));

      await expect(
        litxtoken.bridgeGetOff(deployer.address, amount, 97, 1)
      ).to.be.revertedWith("LITX: caller is not the bridge");

      rcpt = await (
        await litxtoken
          .connect(bridge)
          .bridgeGetOff(deployer.address, amount, 97, 1)
      ).wait();
      expect(rcpt.status).to.equal(1);
      expect(await litxtoken.totalSupply()).to.eq(totalSupply);

      await expect(
        litxtoken.connect(bridge).bridgeGetOff(deployer.address, amount, 97, 1)
      ).to.be.revertedWith("LITX: tx replay");
    });
  });

  describe("Should deploy LITxToken and migrate/trasfer/finalize", function () {
    it("migrate/trasfer/finalize", async function () {
      const amount = 1000000;
      const lithbalance = await lithtoken.balanceOf(deployer.address);

      let rcpt = await (
        await lithtoken.approve(litxtoken.address, amount)
      ).wait();
      expect(rcpt.status).to.equal(1);
      rcpt = await (await litxtoken.ban(deployer.address)).wait();
      expect(rcpt.status).to.equal(1);

      await expect(litxtoken.migrate(user0.address, amount)).to.be.revertedWith(
        "BU: sender banned"
      );

      rcpt = await (await litxtoken.unban(deployer.address)).wait();
      expect(rcpt.status).to.equal(1);
      rcpt = await (await litxtoken.migrate(user0.address, amount)).wait();
      expect(rcpt.status).to.equal(1);

      expect(await lithtoken.balanceOf(deployer.address)).to.equal(
        lithbalance.sub(amount)
      );
      expect(await litxtoken.balanceOf(user0.address)).to.equal(amount);

      rcpt = await (
        await litxtoken.connect(user0).transfer(user1.address, amount)
      ).wait();
      expect(rcpt.status).to.equal(1);
      expect(await litxtoken.balanceOf(user0.address)).to.equal(0);

      const PPM = 100;
      expect(await litxtoken.balanceOf(feedistributor.address)).to.equal(
        amount / PPM
      );
      expect(await litxtoken.balanceOf(user1.address)).to.equal(
        (amount * (PPM - 1)) / PPM
      );

      await expect(litxtoken.finalize()).to.be.revertedWith(
        "LITX: too early"
      );

      await future(period + 1000);

      rcpt = await (await litxtoken.finalize()).wait();
      expect(rcpt.status).to.equal(1);
      expect(await litxtoken.balanceOf(ecosystem.address)).to.equal(
        (await litxtoken.totalSupply()).sub(amount)
      );

      await expect(litxtoken.migrate(user0.address, amount)).to.be.revertedWith(
        "LITX: migration finished"
      );
    });
  });
});
