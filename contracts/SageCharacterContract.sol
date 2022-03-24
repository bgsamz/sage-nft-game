pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract SageCharacterContract {

    struct SageAttributes {
        // TODO adjust uint values/add more
        uint hp;
        uint maxHp;
        uint attackDamage;
        uint sageIndex;

        string name;
        string imageURI;
    }

    SageAttributes[] playableSages;

    mapping (uint => SageAttributes) public sageIdToAttributes;
    mapping (address => uint) public sageOwnerToId;

    constructor(string[] memory sageNames,
                string[] memory sageImageURIs,
                uint16[] memory sageHp,
                uint16[] memory sageAttackDamage) {
                // Initialize each of the sages
        for (uint i = 0; i < sageNames.length; i += 1) {
            playableSages.push(SageAttributes({
                hp:           sageHp[i],
                maxHp:        sageHp[i],
                attackDamage: sageAttackDamage[i],
                sageIndex:    i,
                name:         sageNames[i],
                imageURI:     sageImageURIs[i]
            }));

            SageAttributes memory sage = playableSages[i];
            console.log("Finished initializing %s w/ HP %s, img %s", sage.name, sage.hp, sage.imageURI);
        }
    }

    function getPlayableSages() public view returns (SageAttributes[] memory) {
        return playableSages;
    }
}
