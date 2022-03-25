// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "hardhat/console.sol";
import "./SageBossContract.sol";

contract SageGame is ERC721, SageBossContract {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event SageNFTMinted(address sender, uint tokenId, uint sageIndex);

    constructor(string[] memory sageNames,
                string[] memory sageImageURIs,
                uint[] memory sageHp,
                uint[] memory sageAttackDamage)
            ERC721("--Test Sages--", "TSTSAGE") {
        // Initialize all the sages
        for (uint i = 0; i < sageNames.length; i += 1) {
            addPlayableSage(sageNames[i], sageImageURIs[i], sageHp[i], sageAttackDamage[i]);
        }

        // Have our tokens actually start at 1
        _tokenIds.increment();
    }

    function mintSageNft(uint _sageIndex) public {
        uint newSageId = _tokenIds.current();
        _safeMint(msg.sender, newSageId);

        sageIdToAttributes[newSageId] = SageAttributes({
                hp:           playableSages[_sageIndex].hp,
                maxHp:        playableSages[_sageIndex].maxHp,
                attackDamage: playableSages[_sageIndex].attackDamage,
                sageIndex:    _sageIndex,
                tokenId:      newSageId,
                name:         playableSages[_sageIndex].name,
                imageURI:     playableSages[_sageIndex].imageURI
        });

        console.log("Minted Sage NFT w/ tokenId %s and sageIndex %s", newSageId, _sageIndex);

        sageIdToOwner[newSageId] = msg.sender;
        sageOwnerToId[msg.sender].push(newSageId);
        _tokenIds.increment();

        emit SageNFTMinted(msg.sender, newSageId, _sageIndex);
    }

    function tokenURI(uint _tokenId) public view override returns (string memory) {
        SageAttributes memory sageAttributes = sageIdToAttributes[_tokenId];

        string memory strHp = Strings.toString(sageAttributes.hp);
        string memory strMaxHp = Strings.toString(sageAttributes.maxHp);
        string memory strAttDmg = Strings.toString(sageAttributes.attackDamage);

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                sageAttributes.name,
                ' -- NFT #: ',
                Strings.toString(_tokenId),
                '", "description": "A Sage NFT to play the in the Sageverse!", "image": "',
                sageAttributes.imageURI,
                '", "attributes": [ { "trait_type": "Health Points", "value": ',strHp,', "max_value":',strMaxHp,'}, { "trait_type": "Attack Damage", "value": ',
                strAttDmg,'} ]}'
            )
        );

        string memory output = string(abi.encodePacked("data:application/json;base64,", json));
        return output;
    }

    function attackBoss(uint tokenId) public override {
        super.attackBoss(tokenId);
        if (activeSageBoss.hp == 0) {
            mintSageNft(playableSages.length - 1);
        }
    }

    function getOwnedSageNFTs() public view returns (SageAttributes[] memory) {
        uint[] memory ownedSageIDs = sageOwnerToId[msg.sender];
        SageAttributes[] memory ownedSages = new SageAttributes[](ownedSageIDs.length);
        for (uint i = 0; i < ownedSageIDs.length; i += 1) {
            ownedSages[i] = sageIdToAttributes[ownedSageIDs[i]];
        }
        return ownedSages;
    }
}