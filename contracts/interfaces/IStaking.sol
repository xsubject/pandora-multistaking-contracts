//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IStaking {
    function withdraw(uint256[] memory tokenIds, address to) external;
    function harvest(address to) external;
    function deposit(uint256[] memory tokenIds, address to) external;
    function currentPower(address _user) external view returns(uint256);
    function totalPower() external view returns(uint256);
    function rewardPerSecond() external view returns(uint256);
}