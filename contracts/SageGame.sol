// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

import "hardhat/console.sol";

contract SageGame is ERC721 {

    struct SageAttributes {
        // TODO adjust uint values/add more
        uint hp;
        uint maxHp;
        uint attackDamage;
        uint sageIndex;

        string name;
        string imageURI;
    }

    struct SageBoss {
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    SageAttributes[] defaultSages;
    SageBoss public activeSageBoss;

    mapping (uint => SageAttributes) public sageIdToAttributes;
    mapping (address => uint) public sageOwnerToId;

    event SageNFTMinted(address sender, uint tokenId, uint sageIndex);
    event AttackComplete(uint newBossHp, uint newPlayerHp);

    constructor(string[] memory sageNames,
                string[] memory sageImageURIs,
                uint16[] memory sageHp,
                uint16[] memory sageAttackDamage) ERC721("--Test Sages--", "TSTSAGE") {
        // Initialize each of the sages
        for (uint i = 0; i < sageNames.length; i += 1) {
            defaultSages.push(SageAttributes({
                hp:           sageHp[i],
                maxHp:        sageHp[i],
                attackDamage: sageAttackDamage[i],
                sageIndex:    i,
                name:         sageNames[i],
                imageURI:     sageImageURIs[i]
            }));

            SageAttributes memory sage = defaultSages[i];
            console.log("Finished initializing %s w/ HP %s, img %s", sage.name, sage.hp, sage.imageURI);
        }
        // Have our tokens actually start at 1
        _tokenIds.increment();
    }

    function mintSageNft(uint _sageIndex) external {
        uint newSageId = _tokenIds.current();
        _safeMint(msg.sender, newSageId);

        sageIdToAttributes[newSageId] = SageAttributes({
                hp:           defaultSages[_sageIndex].hp,
                maxHp:        defaultSages[_sageIndex].maxHp,
                attackDamage: defaultSages[_sageIndex].attackDamage,
                sageIndex:    _sageIndex,
                name:         defaultSages[_sageIndex].name,
                imageURI:     defaultSages[_sageIndex].imageURI
        });

        console.log("Minted Sage NFT w/ tokenId %s and sageIndex %s", newSageId, _sageIndex);

        sageOwnerToId[msg.sender] = newSageId;
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

    function spawnBoss(string memory bossName,
                       string memory bossImageURI,
                       uint bossHp,
                       uint bossAttackDamage) public {
        activeSageBoss = SageBoss({
            name: bossName,
            imageURI: bossImageURI,
            hp: bossHp,
            maxHp: bossHp,
            attackDamage: bossAttackDamage
        });
        console.log("Done initializing boss %s w/ HP %s, img %s", activeSageBoss.name, activeSageBoss.hp, activeSageBoss.imageURI);
    }

    function attackBoss() public {
        uint tokenIdOfAttacker = sageOwnerToId[msg.sender];
        SageAttributes storage attacker = sageIdToAttributes[tokenIdOfAttacker];

        console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", attacker.name, attacker.hp, attacker.attackDamage);
        console.log("Boss %s has %s HP and %s AD", activeSageBoss.name, activeSageBoss.hp, activeSageBoss.attackDamage);

        require(attacker.hp > 0, "Attacker must have HP to attack!");
        require(activeSageBoss.hp > 0, "Active boss must have HP to be attacked!");

        // Player attacks first
        if (activeSageBoss.hp < attacker.attackDamage) {
            activeSageBoss.hp = 0;
        } else {
            activeSageBoss.hp = activeSageBoss.hp - attacker.attackDamage;
        }

        // Then boss attacks
        if (attacker.hp < activeSageBoss.attackDamage) {
            attacker.hp = 0;
        } else {
            attacker.hp = attacker.hp - activeSageBoss.attackDamage;
        }

        console.log("Player attacked boss. New boss hp: %s", activeSageBoss.hp);
        console.log("Boss attacked player. New player hp: %s\n", attacker.hp);

        emit AttackComplete(activeSageBoss.hp, attacker.hp);
    }

    function checkIfUserHasNFT() public view returns (SageAttributes memory) {
        uint sageTokenForUser = sageOwnerToId[msg.sender];

        // Array will default to 0, so since we start tokens at 1, we can just check greater than 0
        if (sageTokenForUser > 0) {
            return sageIdToAttributes[sageTokenForUser];
        } else {
            SageAttributes memory emptySage;
            return emptySage;
        }
    }

    function getAllDefaultSages() public view returns (SageAttributes[] memory) {
        return defaultSages;
    }

    function getActiveSageBoss() public view returns (SageBoss memory) {
        return activeSageBoss;
    }
}