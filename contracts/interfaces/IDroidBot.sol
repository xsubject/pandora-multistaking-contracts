// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.7.0) (token/ERC721/IERC721.sol)

pragma solidity ^0.8.0;

interface IDroidBot {
    function create(address, uint256, uint256) external returns(uint256);
    function upgrade(uint256, uint256, uint256) external;
    function burn(uint256) external;
    function power(uint256) external view returns(uint256);
    function level(uint256) external view returns(uint256);
}