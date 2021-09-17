// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {rarity} from "./rarity.sol";

contract WrappedScarcity is ERC721("Wrapped Scarcity Manifested", "WSM"), ERC721Holder {
  // polygon address
  rarity public scarcity = rarity(0x4fb729BDb96d735692DCACD9640cF7e3aA859B25);
  
  function summon(uint256 _class) external {
      uint256 next_summoner = scarcity.next_summoner();
      scarcity.summon(_class);
      _mint(msg.sender, next_summoner);
  }

  function wrap(uint256 tokenId) external {
    // get scarcity nft from user
    scarcity.safeTransferFrom(msg.sender, address(this), tokenId, "");

    // mint wrapped version
    _mint(msg.sender, tokenId);
  }

  function unwrap(uint256 tokenId) external {
    // burn wrapped version
    _burn(tokenId);

    // transfer scarcity nft to user
    scarcity.safeTransferFrom(address(this), msg.sender, tokenId, "");
  }
  
  function adventure(uint256 tokenId) external {
      require(_isApprovedOrOwner(msg.sender, tokenId));
      scarcity.adventure(tokenId);
  }
  
  function level_up(uint256 tokenId) external {
      require(_isApprovedOrOwner(msg.sender, tokenId));
      scarcity.level_up(tokenId);
  }
  
  function spend_xp(uint256 tokenId, uint256 _xp) external{
      require(_isApprovedOrOwner(msg.sender, tokenId));
      scarcity.spend_xp(tokenId, _xp);
  }

    // --- View Functions ---
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    return scarcity.tokenURI(tokenId);
  }
  
  function adventurers_log(uint256 tokenId) external view returns(uint256) {
      return scarcity.adventurers_log(tokenId);
  }
  
  function class(uint256 tokenId) external view returns(uint256) {
      return scarcity.class(tokenId);
  }
  
  function level(uint256 tokenId) external view returns(uint256) {
      return scarcity.level(tokenId);
  }
  
  function summoner(uint256 tokenId) external view returns (uint256 _xp, uint256 _log, uint256 _class, uint256 _level) {
      (_xp, _log, _class, _level) = scarcity.summoner(tokenId);
  }
  
  function xp(uint256 tokenId) external view returns(uint256) {
      return scarcity.xp(tokenId);
  }
  
  function classes(uint256 index) external view returns(string memory) {
      return scarcity.classes(index);
  }
  
  function xp_required(uint256 current_level) external view returns (uint256 xp_to_next_level) {
      xp_to_next_level = scarcity.xp_required(current_level);
  }
}