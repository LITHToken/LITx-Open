const { expect } = require("chai");
const { ethers } = require("hardhat");

/*
 * Built from https://github.com/Uniswap/merkle-distributor/
 * npm generate-merkle-root:example
 * example.json { "0xdd2fd4581271e230360230f9337d5c0430bf44c0": "100", "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199": "101" }
 * {"merkleRoot":"0xd1c71cd4cee6b17d824c48a06d234ec60a4f2400e5dd6f13ed22b4c714859f27","tokenTotal":"0x0201","claims":{"0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199":{"index":0,"amount":"0x0101","proof":["0x56ae380ed1131fbaff773d57c6da798e5c07dc4588582f3f5204120cf59bc6d1"]},"0xdD2FD4581271e230360230F9337D5c0430Bf44C0":{"index":1,"amount":"0x0100","proof":["0x9d372dd6998665eae9f3b57de4fc67bf3572da22ee0dc52b2af12e20b777c9ba"]}}}
 */

describe("FeeDsitributor", function () {
  let deployer;
  let user0;
  let user1;
  let bridge;
  let ecosystem;
  let marketing;
  let feedistributor;
  let lithtoken;
  let litxtoken;

  const period = 60 * 24 * 3600;
  const chains = [4, 97, 80001];
  const merkleRoot =
    "0xd1c71cd4cee6b17d824c48a06d234ec60a4f2400e5dd6f13ed22b4c714859f27";
  const me = "0x8e8A4724D4303aB675d592dF88c91269b426C62a";
  const pk0 =
    "df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";
  const pk1 =
    "de9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0";
  const claim0 = 0x0100;
  const claim1 = 0x0101;
  const proof0 = [
    "0x9d372dd6998665eae9f3b57de4fc67bf3572da22ee0dc52b2af12e20b777c9ba",
  ];
  const proof1 = [
    "0x56ae380ed1131fbaff773d57c6da798e5c07dc4588582f3f5204120cf59bc6d1",
  ];
  const index0 = 1;
  const index1 = 0;

  beforeEach(async function () {
    [deployer, bridge, ecosystem, marketing] = await hre.ethers.getSigners();

    // 0xdd2fd4581271e230360230f9337d5c0430bf44c0
    user0 = new ethers.Wallet(pk0, deployer.provider);
    // 0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199
    user1 = new ethers.Wallet(pk1, deployer.provider);

    const LIThToken = await ethers.getContractFactory("LIThToken");
    lithtoken = await upgrades.deployProxy(LIThToken, ["LITh Token", "LITh"]);
    await lithtoken.deployed();

    const now = Math.floor(Date.now() / 1000);
    const migrateBy = now + period;

    const LITxToken = await ethers.getContractFactory("LITxToken");
    let args = [
      bridge.address,
      ecosystem.address,
      lithtoken.address,
      migrateBy,
      chains,
    ];
    litxtoken = await upgrades.deployProxy(LITxToken, args);
    await litxtoken.deployed();

    const FeeDistributor = await ethers.getContractFactory("FeeDistributor");
    args = [litxtoken.address, ecosystem.address, marketing.address];

    feedistributor = await upgrades.deployProxy(FeeDistributor, args);
    await feedistributor.deployed();

    let rcpt = await (
      await litxtoken.setFeeDistributor(feedistributor.address)
    ).wait();
    expect(rcpt.status).to.equal(1);

    rcpt = await (
      await feedistributor.setDevelopers([user0.address, user1.address])
    ).wait();
    expect(rcpt.status).to.equal(1);
  });

  describe("Should deploy FeeDistributor and check initial state", function () {
    it("check initial state", async function () {
      await expect(
        feedistributor.connect(user0).setDevelopers([])
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        feedistributor.connect(user0).distribute(merkleRoot)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await feedistributor.developers(0)).to.equal(user0.address);
      expect(await feedistributor.developers(1)).to.equal(user1.address);
      expect(await feedistributor.developers(2)).to.equal(me);
      expect(await feedistributor.token()).to.equal(litxtoken.address);
      expect(await feedistributor.ecosystem()).to.equal(ecosystem.address);
      expect(await feedistributor.marketing()).to.equal(marketing.address);
    });
  });

  describe("Should deploy FeeDistributor and distribute/claim", function () {
    it("distribute/claim", async function () {
      const amount = 1000000;
      let rcpt = await (
        await lithtoken.approve(litxtoken.address, amount)
      ).wait();
      expect(rcpt.status).to.equal(1);

      rcpt = await (
        await litxtoken.migrate(feedistributor.address, amount)
      ).wait();
      expect(rcpt.status).to.equal(1);

      expect(await litxtoken.balanceOf(feedistributor.address)).to.equal(
        amount
      );

      rcpt = await (await feedistributor.distribute(merkleRoot)).wait();
      expect(rcpt.status).to.equal(1);

      expect(await litxtoken.balanceOf(user0.address)).to.equal(33333);
      expect(await litxtoken.balanceOf(user1.address)).to.equal(33333);
      expect(await litxtoken.balanceOf(me)).to.equal(33333);
      expect(await litxtoken.balanceOf(ecosystem.address)).to.equal(600000);
      expect(await litxtoken.balanceOf(marketing.address)).to.equal(200000);
      expect(await litxtoken.balanceOf(feedistributor.address)).to.equal(
        100001
      );
      expect(await feedistributor.merkleRoot()).to.equal(merkleRoot);

      expect(
        await feedistributor.isClaimed(merkleRoot, user0.address)
      ).to.equal(false);

      const claim = 1000;
      await expect(
        feedistributor.connect(user0).claim(0, claim, [])
      ).to.be.revertedWith("MerkleDistributor: bad proof");

      rcpt = await (
        await feedistributor.connect(user0).claim(index1, claim1, proof1)
      ).wait();
      expect(rcpt.status).to.equal(1);
      expect(await litxtoken.balanceOf(user0.address)).to.equal(33333 + claim1);

      await expect(
        feedistributor.connect(user0).claim(index1, claim1, proof1)
      ).to.be.revertedWith("MerkleDistributor: already claimed");
    });
  });
});
