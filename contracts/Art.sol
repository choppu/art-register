// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ArtItem is Ownable, ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping (uint256 => address) private authors;

    event Art(uint256 _artId);

    constructor() public ERC721("ArtItem", "AIT") {}

    function createArt(string memory _cid) public {
        _tokenIds.increment();

        uint256 _newItemId = _tokenIds.current();
        _safeMint(msg.sender, _newItemId);
        _setTokenURI(_newItemId, _cid);
        authors[_newItemId] = msg.sender;
  
        emit Art(_newItemId);
    }

    function setBaseURL(string memory _baseURL) public onlyOwner {
        _setBaseURI(_baseURL);
    }
}