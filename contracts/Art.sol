// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ArtItem is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping (uint256 => address) private authors;

    constructor() public ERC721("ArtItem", "AIT") {}

    function createArt(string memory _baseUrl, string memory _cid) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setBaseURI(_baseUrl);
        _setTokenURI(newItemId, _cid);
        authors[newItemId] = msg.sender;
  
        return newItemId;
    }
}