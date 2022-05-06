require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");

require("hardhat-contract-sizer");

require("dotenv").config();

const getChainId = () =>
  ethers.provider._hardhatProvider._provider._chainId ||
  ethers.provider.network.chainId;

let LITxTokenAddress;

const setAddresses = () => {
  const chainId = getChainId();
  switch (chainId) {
    case 4:
      LITxTokenAddress = "0x662370b1889bd16817E0f839BFe52Fbc96F80EEe";
      break;
    case 97:
      LITxTokenAddress = "0x104b17a04cE5a4e2f4eFE4BaC5c051631d882C4c";
      break;
    case 80001:
      LITxTokenAddress = "0x63A45bA2b0D8605c89035081175EEBff641Ba947";
      break;
  }
};

task("mint", "Mints LITx", async (taskArgs, hre) => {
  const [deployer, bridge] = await hre.ethers.getSigners();
  const amount = 1000;
  setAddresses();
  const litx = await await ethers.getContractAt("LITxToken", LITxTokenAddress);
  const tx = await litx
    .connect(bridge)
    .bridgeGetOff(deployer.address, amount, 4, 0);
  await tx.wait();
  console.log(`
    ${amount} LITx tokens minted, tx hash ${tx.hash}\n
  `);
});
