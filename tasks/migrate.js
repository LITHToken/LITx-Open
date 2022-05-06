require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");

require("hardhat-contract-sizer");

require("dotenv").config();

const getChainId = () =>
  ethers.provider._hardhatProvider._provider._chainId ||
  ethers.provider.network.chainId;

let LIThTokenAddress;
let LITxTokenAddress;

const setAddresses = () => {
  const chainId = getChainId();
  switch (chainId) {
    case 4:
      LIThTokenAddress = "0x6cc47FA91A9703A2355046e6Ea113EEe0B8Eedac";
      LITxTokenAddress = "0x662370b1889bd16817E0f839BFe52Fbc96F80EEe";
      break;
    case 97:
      LIThTokenAddress = "";
      LITxTokenAddress = "0x104b17a04cE5a4e2f4eFE4BaC5c051631d882C4c";
      break;
    case 80001:
      LIThTokenAddress = "";
      LITxTokenAddress = "0x63A45bA2b0D8605c89035081175EEBff641Ba947";
      break;
  }
};

task("migrate", "Migrate LITh to LITx", async (taskArgs, hre) => {
  const [deployer] = await hre.ethers.getSigners();
  const amount = 1000000;
  setAddresses();
  const lith = await await ethers.getContractAt("LIThToken", LIThTokenAddress);
  const litx = await await ethers.getContractAt("LITxToken", LITxTokenAddress);
  let tx = await lith.approve(litx.address, amount);
  await tx.wait();
  tx = await litx.migrate(deployer.address, amount);
  await tx.wait();
  console.log(`
    ${amount} LITh tokens migrated to LITx, tx hash ${tx.hash}\n
  `);
});
