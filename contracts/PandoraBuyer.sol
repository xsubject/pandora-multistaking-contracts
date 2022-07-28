//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./interfaces/IExchange.sol";
import "./interfaces/IERC721.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ISwapRouter01.sol";
import "./PandoraMultistaking.sol";
import "hardhat/console.sol";

contract PandoraBuyer {/*
    IExchange public exchange;
    IERC721 public nft;
    ISwapRouter01 public router;
    PandoraMultistaking public pm;

    constructor(PandoraMultistaking _pm) {
        exchange = _pm.exchange();
        nft = _pm.pando();
        router = _pm.router();
        pm = _pm;
    }

    function buy(uint256[] memory tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            try this.buy(tokenId) {} catch {
                console.log("Skip buy", tokenId);
            }
        }
    }

    function buy(uint256 tokenId) external {
        _buy(tokenId);
        nft.transferFrom(address(this), address(pm), tokenId);
        pm.stake(tokenId);
    }

    function _buy(uint256 tokenId) private {
        uint256 askId = exchange.currentAsks(address(nft), tokenId);
        Ask memory ask = exchange.asks(address(nft), tokenId, askId);

        address[] memory path = new address[](2);
        path[0] = router.WETH();
        path[1] = ask.erc20;
        console.log("swap", address(this).balance, "to buy", tokenId);
        console.log("path", path[0], path[1]);

        console.log(ask.erc20, ask.seller, ask.price);

        router.swapETHForExactTokens{value: address(this).balance}(ask.price, path, address(this), block.timestamp);

        IERC20 erc20 = IERC20(ask.erc20);
        erc20.approve(address(exchange), ask.price);

        exchange.buy(address(nft), tokenId, ask.price);
        require(address(this) == nft.ownerOf(tokenId), "Contract not owner of token");
    }

*/}