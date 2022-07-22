import { ethers } from "hardhat";
import { CONTRACT_ADDR } from "./constants";

async function main() {
    const pm = await ethers.getContractAt("PandoraMultistaking", CONTRACT_ADDR);

    const workers = await pm.workersLen();
    console.log(`${pm.address} -> ${workers}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
