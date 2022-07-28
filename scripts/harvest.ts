import { ethers } from "hardhat";
import fs from "fs";
import { CONTRACT_ADDR } from "./constants";
import { keypress } from "./utils";

const getTimestamp = () => {
    if(getTimestamp._currentTimestamp == 0) {
        getTimestamp._currentTimestamp = Math.floor(Date.now() / 1000);
        setTimeout(() => {
            getTimestamp._currentTimestamp = 0;
        }, 2000);
    }
    return getTimestamp._currentTimestamp;
};
getTimestamp._currentTimestamp = 0;


const getLatestClaim = () => {
    let latestClaim: undefined | number;
    
    try {
        latestClaim = parseInt((fs.readFileSync("./.claim.history")).toString());
    } catch {}
    return latestClaim;
}

const updateLatestClaim = () => {
    fs.writeFileSync("./.claim.history", getTimestamp().toString());
}

const DAY = 86400;
const HOUR = 3600;
const MINUTE = 60;

const formatTimestamp = (timestamp: number | undefined) => {
    if(timestamp) {
        const diffTimeIn = getTimestamp()-timestamp;
        let diffTime = diffTimeIn;

        const days = Math.floor(diffTime / DAY);
        diffTime = diffTime % DAY;
        
        const hours = Math.floor(diffTime / HOUR);
        diffTime = diffTime % HOUR;

        const minutes = Math.floor(diffTime / MINUTE);

        let ret = [];
        if(days > 0) {
            ret.push(`${days} days`);
        }
        if(hours > 0) {
            ret.push(`${hours} hours`);
        }
        if(minutes > 0) {
            ret.push(`${minutes} minutes`);
        }
        if(ret.length == 0) {
            ret.push(`${diffTime} seconds`);
        } else {
            ret.push(`(${diffTimeIn} total seconds)`);
        }

        return ret.join(" ");
    }
    return undefined;
}

const calculatePerMonth = (profit: number, timestamp: number) => {
    return calculatePerDay(profit, timestamp) * 30;
}

const calculatePerYear = (profit: number, timestamp: number) => {
    return calculatePerDay(profit, timestamp) * 365;
}

const calculatePerDay = (profit: number, timestamp: number) => {
    return calculatePerSecond(profit, timestamp) * DAY;
}

const calculatePerHour = (profit: number, timestamp: number) => {
    return calculatePerSecond(profit, timestamp) * 3600;
}

const calculatePerSecond = (profit: number, timestamp: number) => {
    let diffTime = getTimestamp()-timestamp;
    return (profit / diffTime);
}

const shortNumberString = (str: string | number) => {
    const src = typeof str == "string" ? str : str.toString();
    return parseFloat(parseFloat(src).toFixed(4)).toString();
}


async function main() {
    const busd = await ethers.getContractAt("IERC20", "0xe9e7cea3dedca5984780bafc599bd69add087d56");
    const pm = await ethers.getContractAt("PandoraMultistaking", CONTRACT_ADDR);
    const [signer] = await ethers.getSigners();

    const before = await busd.callStatic.balanceOf(signer.address);

    const latestClaim = getLatestClaim();
    const timeString = formatTimestamp(latestClaim);

    {
        const profit = await pm.callStatic.harvest(0, (await pm.workersLen()).sub(1));
        const profitString = shortNumberString(ethers.utils.formatEther(profit));
        
        console.log(`\n[W] Connected wallet: ${signer.address}`);
        console.log(`[C] Staking contract: ${pm.address}\n`);
        console.log(`[$] Profit: ~${profitString} BUSD${timeString ? ` per ${timeString}` : ""}`);
        if(latestClaim) {
            const perDay = calculatePerDay(parseFloat(profitString), latestClaim);
            const perMonth = calculatePerMonth(parseFloat(profitString), latestClaim);
            const perYear = calculatePerYear(parseFloat(profitString), latestClaim);
            const perHour = calculatePerHour(parseFloat(profitString), latestClaim);
            console.log(`[P] Estimated profit:`);
            console.log(`\t[1h]   Hourly:\t~${shortNumberString(perHour)} BUSD`);
            console.log(`\t[24h]  Dayly:\t~${shortNumberString(perDay)} BUSD`);
            console.log(`\t[30d]  Monthly:\t~${shortNumberString(perMonth)} BUSD`);
            console.log(`\t[365d] Yearly:\t~${shortNumberString(perYear)} BUSD`);
        }

        console.log("\n[+] Ready?\n\tPress any key to continue or ^C to exit.\n");
        
        await keypress();
    }
    
    
    console.log("Ok, harvesting...");
    const tx = await pm.harvest(0, (await pm.workersLen()).sub(1));
    process.stdout.write(`[TX] ${tx.hash} `);
    await tx.wait(2);

    {
        const after = await busd.balanceOf(signer.address);
        const profit = ethers.utils.formatUnits(after.sub(before), "ether");
        process.stdout.write(`+${profit} BUSD\n\nBye!\n`);

        if(after.sub(before).gt(0)) {
            updateLatestClaim();
        }
    }
    process.exit(0)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
