//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IStaking {
    function withdraw(uint256[] memory tokenIds, address to) external;
    function harvest(address to) external;
    function deposit(uint256[] memory tokenIds, address to) external;
}