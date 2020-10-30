// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@nomiclabs/buidler/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ArtItem is Ownable, ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping (uint256 => address) public registants;
    mapping (string => uint256) public cids;
    mapping (address => uint256) private certificates;

    event Art(uint256 _artId);

    constructor() public ERC721("ArtItem", "AIT") {}

    function createArt(string memory _cid, address _certificate) public {
        _tokenIds.increment();

        uint256 _newItemId = _tokenIds.current();
        _safeMint(msg.sender, _newItemId);
        _setTokenURI(_newItemId, _cid);
        registants[_newItemId] = msg.sender;
        cids[_cid] = _newItemId;

        if (_certificate != address(0)) {
            certificates[_certificate] = _newItemId;
        }
  
        emit Art(_newItemId);
    }

    function tokensOfOwner(address _owner) external view returns( uint256[] memory ownerTokens) {
        uint256 tokenCount = balanceOf(_owner);

        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalArts = totalSupply();
            uint256 resultIndex = 0;
            uint256 artId;

            for (artId = 1; artId <= totalArts; artId++) {
                if (ownerOf(artId) == _owner) {
                    result[resultIndex] = artId;
                    resultIndex++;
                }
            }

            return result;
        }
    }

    function setBaseURL(string memory _baseURL) public onlyOwner {
        _setBaseURI(_baseURL);
    }
}