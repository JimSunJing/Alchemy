// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

// deployed on mumbai: 0xB674E69183325e090a33816767e896ec13BB2ef3
// after complete challenge: 0x8a05f00942b1c241fEC8eCf9C9C95A23e939aa88

contract ChainBattles is ERC721URIStorage {
  using Strings for uint256;
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  struct Levels {
    uint256 level;
    uint256 speed;
    uint256 strength;
    uint256 life;
  }

  mapping(uint256 => Levels) tokenIdToLevels;

  constructor() ERC721 ("ChainBattles","CBTLS") {

  }

  function generateCharacter(uint256 tokenId) public view returns(string memory){
    Levels memory info = getLevels(tokenId);
    bytes memory svg = abi.encodePacked(
        '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
        '<style>.base { fill: white; font-family: serif; font-size: 14px; }</style>',
        '<rect width="100%" height="100%" fill="black" />',
        '<text x="50%" y="40%" class="base" dominant-baseline="middle" text-anchor="middle">',"Warrior",'</text>',
        '<text x="50%" y="50%" class="base" dominant-baseline="middle" text-anchor="middle">', "Levels: ",info.level.toString(),'</text>',
        '<text x="50%" y="60%" class="base" dominant-baseline="middle" text-anchor="middle">', "Strength: ",info.strength.toString(),'</text>',
        '<text x="50%" y="70%" class="base" dominant-baseline="middle" text-anchor="middle">', "Life: ",info.life.toString(),'</text>',
        '</svg>'
    );
    return string(
        abi.encodePacked(
            "data:image/svg+xml;base64,",
            Base64.encode(svg)
        )    
    );
  }

  function getLevels(uint256 tokenId) public view returns(Levels memory) {
    Levels memory levels = tokenIdToLevels[tokenId];
    return levels;
  }

  function getTokenURI(uint256 tokenId) public view returns (string memory){
    bytes memory dataURI = abi.encodePacked(
        '{',
            '"name": "Chain Battles #', tokenId.toString(), '",',
            '"description": "Battles on chain",',
            '"image": "', generateCharacter(tokenId), '"',
        '}'
    );
    return string(
        abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(dataURI)
        )
    );
  }

  function mint() public {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _safeMint(msg.sender, newItemId);
    tokenIdToLevels[newItemId] = Levels(0, random(10), random(10), 50);
    _setTokenURI(newItemId, getTokenURI(newItemId));
  }

  function train(uint256 tokenId) public {
    require(_exists(tokenId),"You need to mint before training.");
    require(_isApprovedOrOwner(msg.sender, tokenId),"You are not the owner of this NFT");
    tokenIdToLevels[tokenId].level += 1;
    tokenIdToLevels[tokenId].speed += 2;
    tokenIdToLevels[tokenId].strength += 3;
    _setTokenURI(tokenId, getTokenURI(tokenId));
  }

  function random(uint256 limit) public view returns (uint256){
    return uint(keccak256(abi.encodePacked(
      block.timestamp,
      block.difficulty,
      msg.sender
    ))) % limit;
  }

}