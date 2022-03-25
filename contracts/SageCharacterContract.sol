// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract SageCharacterContract {

    struct SageAttributes {
        // TODO adjust uint values/add more
        uint hp;
        uint maxHp;
        uint attackDamage;
        uint sageIndex;
        uint tokenId;
        string name;
        string imageURI;
    }

    SageAttributes[] playableSages;

    mapping (uint => SageAttributes) public sageIdToAttributes;
    mapping (uint => address) public sageIdToOwner;
    mapping (address => uint[]) public sageOwnerToId;

    function addPlayableSage(string memory name,
                             string memory imageURI,
                             uint hp,
                             uint attackDamage) internal {
        uint newSageIndex = playableSages.length;
        playableSages.push(SageAttributes({
            hp:           hp,
            maxHp:        hp,
            attackDamage: attackDamage,
            sageIndex:    newSageIndex,
            tokenId:      0,
            name:         name,
            imageURI:     imageURI
        }));

        SageAttributes memory newSage = playableSages[newSageIndex];
        console.log("Finished initializing %s w/ HP %s, img %s", newSage.name, newSage.hp, newSage.imageURI);
    }

    function getPlayableSages() public view returns (SageAttributes[] memory) {
        return playableSages;
    }
}
