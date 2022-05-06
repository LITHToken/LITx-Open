const { expect } = require("chai");
const { ethers } = require("hardhat");

async function main() {
  const [deployer, bridge, ecosystem, marketing] =
    await hre.ethers.getSigners();

  const LIThToken = await ethers.getContractFactory("LIThToken");
  const lithtoken = await upgrades.deployProxy(LIThToken, [
    "LITh Token",
    "LITh",
  ]);
  await lithtoken.deployed();

  const now = Math.floor(Date.now() / 1000);

  const LITxToken = await ethers.getContractFactory("LITxToken");
  const args = [
    bridge.address,
    ecosystem.address,
    lithtoken.address,
    now + 60 * 24 * 3600,
    [4, 97, 80001],
  ];
  const litxtoken = await upgrades.deployProxy(LITxToken, args);
  await litxtoken.deployed();

  const FeeDistributor = await ethers.getContractFactory("FeeDistributor");
  const feedistributor = await upgrades.deployProxy(FeeDistributor, [
    litxtoken.address,
    ecosystem.address,
    marketing.address,
  ]);
  await feedistributor.deployed();

  let rcpt = await (
    await litxtoken.setFeeDistributor(feedistributor.address)
  ).wait();
  expect(rcpt.status).to.equal(1);

  console.log("LITxToken deployed to", litxtoken.address, "with args", args);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
