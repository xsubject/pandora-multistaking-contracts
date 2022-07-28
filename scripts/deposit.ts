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

    const sendBatch = async () => {
        console.log("Send batch:", buffer.join(","));

        const gas = await pm.estimateGas.deposit(buffer);
        const tx = await pm.deposit(buffer, {
            gasLimit: gas.div(100).mul(120),
            gasPrice: ethers.utils.parseUnits("5", "gwei")
        });
        
        console.log(tx.hash);
        await tx.wait(5);
        buffer = [];
    }

    while(i < stakedTokens.length) {
        const tokenId = stakedTokens[i];
        const owner = await nft.ownerOf(tokenId);
        if(owner == signer.address) {
            console.log(`Add ${tokenId.toString()} to batch, owner: ${owner}`);
            buffer.push(tokenId);

            if(buffer.length >= 15) {
                await sendBatch();
            }
        } else {
            console.log(`Skip ${tokenId}, owner: ${owner}`);
        }

        if(i == stakedTokens.length-1 && buffer.length > 0) {
            await sendBatch();
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
