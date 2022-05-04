const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
        tokenId: characterData.tokenId ? characterData.tokenId.toNumber() : null,
        price: characterData.price ? characterData.price.toBigInt() : null,
    }
};

export { transformCharacterData };