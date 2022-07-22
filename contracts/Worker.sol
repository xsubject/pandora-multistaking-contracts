//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IERC721Receiver.sol";
import "./interfaces/IERC721.sol";

contract Worker is IERC721Receiver {
    using EnumerableSet for EnumerableSet.UintSet;
    IStaking private staking = IStaking(0x9CFB7714527B58A04C2f78B4215e3e4feF598e66);
    IERC721 private erc721;

    EnumerableSet.UintSet private tokens;

    address private owner = msg.sender;
    modifier perm {
        require(owner == msg.sender, "Worker: Only owner can be call");
        _;
    }

    constructor(address erc721Address) {
        erc721 = IERC721(erc721Address);
        erc721.setApprovalForAll(address(staking), true);
    }

    function onERC721Received(
        address,
        address,
        uint256 tokenId,
        bytes calldata
    ) external override returns (bytes4) {
        require(address(erc721) == msg.sender, "Invalid token received");
        stake(tokenId);
        return IERC721Receiver.onERC721Received.selector;
    }

    function stake(uint256 tokenId) public {
        uint256[] memory tokenIds = new uint256[](1);
        tokenIds[0] = tokenId;
        staking.deposit(tokenIds, address(this));
        tokens.add(tokenId);
    }

    function execute(address to, bytes calldata data) external payable perm returns (bool success, bytes memory response) {
        (success, response) = to.call{value: msg.value}(data);
    }

    function harvest(address to) external perm {
        staking.harvest(to);
    }

    function clear(address to) external perm returns (uint256[] memory) {
        uint256 tokensLen = tokens.length();
        uint256[] memory t = new uint256[](tokensLen);
        for (uint256 i = 0; i < tokensLen; i++) {
            t[i] = tokens.at(i);
        }
        staking.withdraw(t, to);
        return t;
    }

    function isFree() external view returns (bool) {
        return tokens.length() < 4;
    }

    function len() external view returns (uint256) {
        return tokens.length();
    }
}
