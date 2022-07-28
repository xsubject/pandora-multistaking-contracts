// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const PM = await ethers.getContractFactory("PandoraMultistaking");
  const pm = await PM.deploy("0xd721214DA2c92f927745Bf7F23e8926A3Fed315A", "0x9CFB7714527B58A04C2f78B4215e3e4feF598e66");
  const [signer] = await ethers.getSigners();

  await pm.deployed();

  console.log("PM deployed to:", pm.address, "by", signer.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
