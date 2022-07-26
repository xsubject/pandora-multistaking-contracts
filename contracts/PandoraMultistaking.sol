//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IERC721.sol";
import "./interfaces/IStaking.sol";
import "./Worker.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/IERC721Receiver.sol";

contract PandoraMultistaking is IERC721Receiver {
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;
    address private owner = msg.sender;

    event Harvested(uint256 amount);
    event Deposited(uint256 tokenId, address worker);

    modifier perm {
        require(msg.sender == owner, "PM: Only owner");
        _;
    }

    EnumerableSet.AddressSet private workers;

    IERC721 public pando;
    IStaking public staking;

    constructor(
        IERC721 _pando, 
        IStaking _staking
    ) {
        pando = _pando;
        staking = _staking;

        workers.add(address(new Worker(pando, staking)));
    }

    IERC20 private busd = IERC20(0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56);

    function stake(uint256[] memory tokenIds) public {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            stake(tokenIds[i]);
        }
    }

    function stake(uint256 tokenId) public {
        uint256 workerIndex = workers.length()-1;
        Worker worker = Worker(workers.at(workerIndex));
        if(worker.isFree()) {
            pando.transferFrom(address(this), address(worker), tokenId);
            worker.stake(tokenId);
            emit Deposited(tokenId, address(worker));
        } else {
            console.log("Create new worker...");
            workers.add(address(new Worker(pando, staking)));
            stake(tokenId);
        }
    }

    function harvest(uint256 from, uint256 to) external returns (uint256) {
        uint256 beforeBusd = busd.balanceOf(owner);

        for (uint256 i = from; i < to+1; i++) {
            address workerAddress = workers.at(i);
            Worker worker = Worker(workerAddress);
            try worker.harvest(owner) {} catch {}

            if(worker.len() == 0) {
                workers.remove(workerAddress);
            }
        }

        uint256 afterBusd = busd.balanceOf(owner);
        emit Harvested(afterBusd-beforeBusd);
        return afterBusd-beforeBusd;
    }

    function _clear(address worker) private {
        Worker(worker).clear(owner);
        workers.remove(worker);
    }

    function clear(address worker) external perm {
        _clear(worker);
    }

    function clear(uint workerIndex) external perm {
        address workerAddress = workers.at(workerIndex);
        _clear(workerAddress);
    }

    function workersLen() external view returns (uint256) {
        return workers.length();
    }

    function workerAt(uint256 index) external view returns (address) {
        return workers.at(index);
    }

    function execute(address worker, address to, bytes calldata data) external payable perm returns (bool success, bytes memory response) {
        return Worker(worker).execute(to, data);
    }

    function deposit(uint256[] memory tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            pando.transferFrom(msg.sender, address(this), tokenIds[i]);
            stake(tokenIds[i]);
        }
    }

    receive() external payable {}

    function onERC721Received(
        address,
        address,
        uint256 tokenId,
        bytes calldata
    ) external override returns (bytes4) {
        stake(tokenId);
        return IERC721Receiver.onERC721Received.selector;
    }
}
