import { BigNumber, BigNumberish, Contract } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { BgYellow, Blink, Bright, Dim, FgBlue, FgGreen, FgYellow, removeColors, Reset, Underscore } from "./colors";
import { formatAmount, formatTokenInfo, getStaking, getTokenLevels, getWorkerAt, getWorkerInfo, getWorkersCount } from "./utils";


const wait = async (timeout: number) => new Promise(done => setTimeout(done, timeout));

async function main() {
    console.log(`${BgYellow}  Index\t${" ".repeat(18)}Address${" ".repeat(18)}${" ".repeat(14)}Tokens${" ".repeat(15)} Per day ${Reset}`);

    const staking = await getStaking();
    const busd = await ethers.getContractAt("IERC20", "0xe9e7cea3dedca5984780bafc599bd69add087d56");
    const decimals = await busd.decimals();

    const rewardPerSecond = await staking.rewardPerSecond();
    const rewardPerDay = rewardPerSecond.mul(3600).mul(24);
    const totalPower = (await staking.totalPower()).toNumber();
    let workersPower = 0;

    const formatBusd = (amount: BigNumberish | undefined) => formatAmount(amount, decimals, "BUSD");

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
