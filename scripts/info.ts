import { ethers } from "hardhat";
import { CONTRACT_ADDR, NFT_ADDR } from "./constants";
import stakedTokens from "./stakedTokens";

type Owner = {
    address: string;
    isContract: boolean | Promise<boolean>;
    wait: () => Promise<Owner>;
    __wait: (() => void) | undefined;
}

async function getOwners() {
    const owners: string[] = [];
    const nft = await ethers.getContractAt("IERC721", NFT_ADDR);
    for (const i in stakedTokens) {
        const tokenId = stakedTokens[i];
        const owner = await nft.ownerOf(tokenId);

        if(owners.indexOf(owner) == -1) {
            owners.push(owner);
        }
    }
    
    const objectsOwners: Owner[] = [];
    for (const i in owners) {
        const owner = owners[i];
        const objectsOwnersIndex = objectsOwners.length;
        objectsOwners.push({
            address: owner,
            isContract: new Promise<boolean>(done => {
                ethers.provider.getCode(owner).then(code => {
                    const isContract = code != "0x";
                    objectsOwners[objectsOwnersIndex].isContract = isContract;
                    done(isContract);
                    if(objectsOwners[objectsOwnersIndex].__wait) {
                        (objectsOwners[objectsOwnersIndex].__wait as (() => void))();
                    }
                });
            }),
            wait: () => new Promise(done => {
                if(typeof objectsOwners[objectsOwnersIndex].isContract == "boolean") {
                    return done(objectsOwners[objectsOwnersIndex]);
                }
                objectsOwners[objectsOwnersIndex].__wait = () => {
                    done(objectsOwners[objectsOwnersIndex]);
                };
            }),
            __wait: undefined
        });
    }

    return objectsOwners;
}

async function main() {
    const pm = await ethers.getContractAt("PandoraMultistaking", CONTRACT_ADDR);
    const owners = await getOwners();
    
    console.log(await owners[0].wait())

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
