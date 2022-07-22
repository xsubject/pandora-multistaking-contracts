import { ethers } from "hardhat";
import { CONTRACT_ADDR, NFT_ADDR } from "./constants";

async function main() {
    const pm = await ethers.getContractAt("PandoraMultistaking", CONTRACT_ADDR);

    while(true) {
        try {
            const tx = await pm['clear(uint256)'](0);
            console.log(tx.hash);
            await tx.wait(2);

        } catch (e) {
            console.log(e);
            return;
        }

    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
