import { Contract } from "ethers";
import { ethers } from "hardhat";
import { getPm, getWorkerInfo, getWorkers } from "./utils";
import prompt from "prompt-sync";
import { Bright, Dim, FgCyan, FgYellow, Reset } from "./colors";
const input = prompt({ sigint: true });

const renderWorkers = (workers: Contract[]) => {
    workers.map((worker, index) => {
        console.log(index, worker.address)
    });
}

const selectWorker = (workers: Contract[]): {index: number, worker: Contract} => {
    const src = input("Write index of selected worker: ");
    const index = parseInt(src);
    if(index < 0 || index > workers.length-1 || isNaN(index)) {
        console.log("Invalid index");
        return selectWorker(workers);
    }
    const worker = workers[index];
    return {index, worker};
}

const selectTo = (): string => {
    const src = input("Write address to call: ");
    if(src.length != 42) {
        console.log("Invalid address");
        return selectTo();
    }
    return src;
}

async function main() {
    const workers = await getWorkers();
    renderWorkers(workers);

    const {worker, index} = selectWorker(workers);
    const info = await getWorkerInfo(worker);
    console.log(`Selected worker: ${Bright}${FgYellow}${worker.address}${Reset}`);
    console.log(`Token ids: ${Bright}${FgYellow}${Dim}${info.tokenIds.join(", ")}${Reset}`);
    console.log(`Power: ${Bright}${FgYellow}${Dim}${info.power}${Reset}\n`)
    const to = selectTo();
    const calldata = input("Calldata: ");

    console.log(`\n${Bright}${FgCyan}Summary${Reset}`);
    console.log(`From: ${Dim}${worker.address}(${index})${Reset}`);
    console.log(`To: ${Dim}${to}${Reset}`);
    console.log(`Calldata: ${Dim}${calldata}${Reset}`);

    const ready = input("Ready? (Y/n)");
    if(ready.toLowerCase() == "y") {
        const pm = await getPm();
        const tx = await pm.execute(worker.address, to, calldata);
        console.log(tx.hash);
        await tx.wait(2);
    } else {
        console.log("bye");
    }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
