// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./SageCharacterContract.sol";

contract SageBossContract is SageCharacterContract {

    struct SageBoss {
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
        uint price;
    }

    SageBoss public activeSageBoss;

    event AttackComplete(uint newBossHp, uint playerTokenId, uint newPlayerHp);

    function spawnBoss(string memory bossName,
                       string memory bossImageURI,
                       uint bossHp,
                       uint bossAttackDamage,
                       uint price) public {
        activeSageBoss = SageBoss({
            name:         bossName,
            imageURI:     bossImageURI,
            hp:           bossHp,
            maxHp:        bossHp,
            attackDamage: bossAttackDamage,
            price:        price
        });
        console.log("Done initializing boss %s w/ HP %s, img %s", activeSageBoss.name, activeSageBoss.hp, activeSageBoss.imageURI);
    }

    function attackBoss(uint tokenId) public virtual {
        require(sageIdToOwner[tokenId] == msg.sender, "Only Sage owner can initiate boss attack!");
        SageAttributes storage attacker = sageIdToAttributes[tokenId];

        console.log("\nPlayer w/ character %s about to attack. Has %s HP and %s AD", attacker.name, attacker.hp, attacker.attackDamage);
        console.log("Boss %s has %s HP and %s AD", activeSageBoss.name, activeSageBoss.hp, activeSageBoss.attackDamage);

        require(attacker.hp > 0, "Attacker must have HP to attack!");
        require(activeSageBoss.hp > 0, "Active boss must have HP to be attacked!");

        // Player attacks first
        if (activeSageBoss.hp <= attacker.attackDamage) {
            activeSageBoss.hp = 0;
            // Now that the boss has reached 0 health, we'll make it a playable sage
            convertBossToPlayableSage();
        } else {
            activeSageBoss.hp = activeSageBoss.hp - attacker.attackDamage;
        }

        // Then boss attacks, if it still has HP
        if (activeSageBoss.hp > 0) {
            if (attacker.hp < activeSageBoss.attackDamage) {
                attacker.hp = 0;
            } else {
                attacker.hp = attacker.hp - activeSageBoss.attackDamage;
            }
        }

        console.log("Player attacked boss. New boss hp: %s", activeSageBoss.hp);
        console.log("Boss attacked player. New player hp: %s\n", attacker.hp);

        emit AttackComplete(activeSageBoss.hp, tokenId, attacker.hp);
    }

    function convertBossToPlayableSage() private {
        addPlayableSage(activeSageBoss.name,
                        activeSageBoss.imageURI,
                        activeSageBoss.maxHp / 10,
                        activeSageBoss.attackDamage * 2,
                        activeSageBoss.price);
    }

    function getActiveSageBoss() public view returns (SageBoss memory) {
        return activeSageBoss;
    }
}
