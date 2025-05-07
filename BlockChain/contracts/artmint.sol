// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AIArtNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    uint256 public mintFee = 0.01 ether;

    // Pass msg.sender as initialOwner to Ownable constructor
    constructor() ERC721("AIArtNFT", "AIART") Ownable(msg.sender) {
        tokenCounter = 0;
    }

    // Public minting with payment
    function mintArt(string memory _tokenUri) public payable returns (uint256) {
        require(msg.value >= mintFee, "Insufficient ETH sent");

        uint256 newItemId = tokenCounter;
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenUri);

        tokenCounter += 1;
        return newItemId;
    }

    // Owner can withdraw collected ETH
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Owner can update minting fee
    function setMintFee(uint256 _newFee) public onlyOwner {
        mintFee = _newFee;
    }
}
