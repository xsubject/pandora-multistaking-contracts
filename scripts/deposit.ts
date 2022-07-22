import { ethers } from "hardhat";
import { CONTRACT_ADDR, NFT_ADDR } from "./constants";
import stakedTokens from "./stakedTokens";

async function main() {
    const pm = await ethers.getContractAt("PandoraMultistaking", CONTRACT_ADDR);
    const nft = await ethers.getContractAt("IERC721", NFT_ADDR);
    const [signer] = await ethers.getSigners();

    const isApprovedForAll = await nft.isApprovedForAll(signer.address, pm.address);
    if(!isApprovedForAll) {
        console.log("Approving...");
        await (await nft.setApprovalForAll(pm.address, true)).wait(1);
    }
    // 2377, 6743, 7207, 7216
    // console.log(stakedTokens);

    let i = 0;
    let buffer: number[] = [];
    while(i < stakedTokens.length) {
        const tokenId = stakedTokens[i];
        const owner = await nft.ownerOf(tokenId);
        if(owner == signer.address) {
            console.log(`Add ${tokenId.toString()} to batch...`);
            buffer.push(tokenId);
            
            if(buffer.length >= 10 || i == stakedTokens.length-1) {

                console.log("Send batch...")
                const tx = await pm.deposit(buffer);
                console.log(tx.hash);
                await tx.wait(5);
                buffer = [];
            }
        } else {
            console.log(`Skip ${tokenId}, owner: ${owner}`);
        }
        i++;
    }
    // if(nft.ownerOf())
    

    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
