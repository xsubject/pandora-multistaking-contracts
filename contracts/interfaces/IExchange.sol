//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

struct Ask {
    address erc20;
    address seller;
    uint256 price;
}

interface IExchange {
    function buy(address erc721, uint256 tokenId, uint256 amount) external;
    function currentAsks(address erc721, uint256 tokenId) external view returns (uint256);
    function asks(address erc721, uint256 tokenId, uint256 askId) external view returns (Ask memory);
}