import { BigNumber, BigNumberish, Contract } from "ethers";
import { ethers } from "hardhat";
import { Bright, Dim, FgCyan, FgGreen, FgMagenta, FgYellow, Reset, Underscore } from "./colors";
import { CONTRACT_ADDR, NFT_ADDR, STAKING_ADDR } from "./constants";
import { IERC721, IStaking, PandoraMultistaking, Worker } from "./types";

let _pm: PandoraMultistaking;
let _nft: IERC721;
let _staking: IStaking;
export type TokenInfo = {tokenId: number, level: number};

export const getStaking = async (): Promise<IStaking> => {
    if(_staking) return _staking;
    _staking = await ethers.getContractAt("IStaking", STAKING_ADDR);
    return _staking;
}

export const getPm = async (): Promise<PandoraMultistaking> => {
    if(_pm) return _pm;
    _pm = await ethers.getContractAt("PandoraMultistaking", CONTRACT_ADDR);
    return _pm;
}

export const getNft = async (): Promise<IERC721> => {
    if(_nft) return _nft;
    _nft = await ethers.getContractAt("IDroidBot", NFT_ADDR);
    return _nft;
}

export const getWorkerAt = async (index: number): Promise<Worker> => {
    const workerAddr = await (await getPm()).workerAt(index);
    return await ethers.getContractAt("Worker", workerAddr);
}

export const getWorkersCount = async () => {
    return (await (await getPm()).workersLen()).toNumber();
}

export const getWorkers = async (): Promise<Worker[]> => {
    const len = await getWorkersCount();
    const workers: Promise<Worker>[] = [];
    for (let i = 0; i < len; i++) {
        const worker = new Promise<Worker>(async (res) => {
            res(await getWorkerAt(i));
        });
        workers.push(worker);
    }
    return Promise.all(workers);
}

export const getTokenLevels = async (tokenIds: number[]) => {
    const tokensInfo: TokenInfo[] = [];
    const nft = await getNft();
    const levels = await Promise.all(
        tokenIds.map(tokenId => nft.level(tokenId))
    );

    return levels.map(l => parseInt(l) + 1);
}

export const getWorkerInfo = async (worker: Contract) => {
    const staking = await getStaking();
    const powerPromise = staking.currentPower(worker.address);

    const tokenIdsPromise = worker.getTokenIds();
    const [powerResponse, tokenIdsResponse] = await Promise.all([powerPromise, tokenIdsPromise]);

    const power = powerResponse.toNumber();
    const tokenIds = tokenIdsResponse.map((item: BigNumber) => item.toNumber());

    return {power, tokenIds};
}

export const keypress = async () => {
    process.stdin.setRawMode(true)
    return new Promise(resolve => process.stdin.once('data', data => {
      const byteArray = [...data]
      if (byteArray.length > 0 && byteArray[0] === 3) {
        console.log('Bye!\n^C')
        process.exit(1)
      }
      process.stdin.setRawMode(false)
      resolve(true)
    }))
}

export const formatTokenInfo = (tokenId: number, level: number) => {
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

export const formatAmount = (amount: BigNumberish | undefined, decimals: number = 18, symbol: string = "???") => {
    const amt = amount != undefined ? 
        parseFloat(ethers.utils.formatUnits(amount, decimals)).toFixed(2) :
        "?.??";

    return `${Underscore}${Bright}${FgYellow}${amt + `${Reset}${FgYellow} ${symbol}${Reset}`}`;
}
