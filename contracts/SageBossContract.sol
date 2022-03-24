pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract SageBossContract {

    struct SageBoss {
        string name;
        string imageURI;
        uint hp;
        uint maxHp;
        uint attackDamage;
    }

    SageBoss public activeSageBoss;

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

    function getActiveSageBoss() public view returns (SageBoss memory) {
        return activeSageBoss;
    }
}
