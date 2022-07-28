import { BigNumber, BigNumberish, Contract } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { BgYellow, Blink, Bright, Dim, FgBlack, FgBlue, FgCyan, FgGreen, FgMagenta, FgYellow, Hidden, removeColors, Reset, Reverse, Underscore } from "./colors";
import { CONTRACT_ADDR, NFT_ADDR, STAKING_ADDR } from "./constants";
import stakedTokens from "./stakedTokens";
import { getTokenLevels, getWorkerAt, getWorkerInfo, getWorkersCount, TokenInfo } from "./utils";


const formatTokenInfo = (tokenId: number, level: number) => {
    let color = Reset;

    switch(level) {
        case 1:
            color = FgCyan;
            break;
        case 2:
            color = FgGreen;
            break;
        case 3:
            color = FgYellow;
            break;
        case 4:
            color = FgMagenta;
            break;
    }

    return `${color}${Bright}L${level}${Reset}${color}${Dim}#${tokenId}${Reset}`;
}

const wait = async (timeout: number) => new Promise(done => setTimeout(done, timeout));

async function main() {
    console.log(`${BgYellow}  Index\t${" ".repeat(18)}Address${" ".repeat(18)}${" ".repeat(14)}Tokens${" ".repeat(15)} Per day ${Reset}`);

    const pm = await ethers.getContractAt("PandoraMultistaking", CONTRACT_ADDR);
    const staking = await ethers.getContractAt("IStaking", STAKING_ADDR);
    const busd = await ethers.getContractAt("IERC20", "0xe9e7cea3dedca5984780bafc599bd69add087d56");
    const nft = await ethers.getContractAt("IDroidBot", NFT_ADDR);
    const decimals = await busd.decimals();

    const rewardPerSecond = await staking.rewardPerSecond();
    const rewardPerDay = rewardPerSecond.mul(3600).mul(24);
    const totalPower = (await staking.totalPower()).toNumber();
    let allTokens: TokenInfo[] = [];
    let workersPower = 0;


    const formatBusd = (amount: BigNumberish | undefined) => {
        const amt = amount != undefined ? 
            parseFloat(formatUnits(amount, decimals)).toFixed(2) :
            "?.??";

        return `${Underscore}${Bright}${FgYellow}${amt + `${Reset}${FgYellow} BUSD${Reset}`}`;
    }

    const calculateRewardPerDay = (power: BigNumberish): {percent: number, amount: BigNumber} => {
        if(typeof power == "object") {
            power = (power as any).toNumber();
        }
        const percent = ((power as number) / totalPower) * 100;

        const amount = rewardPerDay.div(
                (10 ** (decimals+2)).toString()
            ).mul(
                Math.floor(percent * (10 ** decimals)).toString()
            );
        
        return {
            percent,
            amount
        }
    }

    const renderWorkerInfo = (index: number, worker: Contract, tokenIds?: number[], levels?: number[], amount?: BigNumberish) => {
        const buffer: string[] = [];        

        const header = `\r${FgYellow}${index}.${Reset}\t${Dim}${worker.address}${Reset}`;
        buffer.push(header);        

        if(tokenIds) {
            const tokens = tokenIds.map((tokenId: number, index: number) => {
                return levels == undefined ? `${FgBlue}L?#${Dim}${tokenId}${Reset}` : formatTokenInfo(tokenId, levels[index]);
            }).join("  ");
            buffer.push(`${tokens}${Reset}`);
        } else {
            buffer.push(`${FgGreen}L?#????  L?#????  L?#????  L?#????${Reset}`);
        }

        buffer.push(formatBusd(amount ? amount : undefined));
        
        const totalLen = removeColors(buffer.join(" ")).length;

        const spaces = totalLen < process.stdout.columns ? process.stdout.columns-totalLen-5 : 0;
        if(spaces > 0) {
            buffer.push(" ".repeat(spaces));
        }
        process.stdout.write(buffer.join(" "));

    };


    // const workers = await getWorkers();
    let tokensCount = 0;
    const workersCount = await getWorkersCount();
    
    
    for (let i = 0; i < workersCount; i++) {
        const worker = await getWorkerAt(i);
        renderWorkerInfo(i, worker);
        const {power, tokenIds} = await getWorkerInfo(worker);
        const workerRewardPerDay = calculateRewardPerDay(power);
        tokensCount += tokenIds.length;
        renderWorkerInfo(i, worker, tokenIds, undefined, workerRewardPerDay.amount);

        let levels: number[] = await getTokenLevels(tokenIds);
        workersPower += power;        
        renderWorkerInfo(i, worker, tokenIds, levels, workerRewardPerDay.amount);
        console.log();
    }
    
    const workersRewardPerDay = calculateRewardPerDay(workersPower);

    console.log(`\nCount: ${Blink}${Bright}${tokensCount}${Reset}`);

    console.log(`\nReward per day: ${formatBusd(workersRewardPerDay.amount)}${Reset}/${formatBusd(rewardPerDay)} ${Blink}${workersRewardPerDay.percent.toFixed(2)}%${Reset}`);
    console.log(`Reward per month: ${formatBusd(workersRewardPerDay.amount.mul(30))}`);
    console.log(`Reward per year: ${formatBusd(workersRewardPerDay.amount.mul(365))}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
