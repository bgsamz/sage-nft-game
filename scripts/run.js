const main = async () => {
    const [owner] = await hre.ethers.getSigners();
    const gameContractFactory = await hre.ethers.getContractFactory('SageGame');
    const pointOneEther = hre.ethers.utils.parseEther("0.1");
    const gameContract = await gameContractFactory.deploy(
        ["Snowy Sage", "Armored Sage", "Sleepy Sage"], // Names
        [
            "https://i.imgur.com/j9R2sQh.jpg", // SnowySage
            "https://i.imgur.com/73RBJmN.jpg", // ArmoredSage
            "https://i.imgur.com/4KMzpDq.jpg", // SleepySage
        ],
        [75, 100, 25], // HP
        [100, 25, 25], // Attack
        [pointOneEther, pointOneEther, pointOneEther]
    );
    await gameContract.deployed();
    console.log("Contract deployed to:", gameContract.address);

    let txn;
    txn = await gameContract.spawnBoss("Stretchy Sage",
                                       "https://i.imgur.com/vAZVX3b.jpg",
                                       1000,
                                       1,
                                       hre.ethers.utils.parseEther("2.0"));
    await txn.wait();

    txn = await gameContract.getOwnedSageNFTs();
    console.log("Owned Sage NFTs:", txn);

    txn = await gameContract.mintSageNft(0, { value: pointOneEther });
    await txn.wait();

    txn = await gameContract.getOwnedSageNFTs();
    console.log("Owned Sage NFTs:", txn);

    let returnedTokenUri = await gameContract.tokenURI(1);
    console.log("Token URI:", returnedTokenUri);

    for (let i = 0; i < 10; i++) {
        txn = await gameContract.attackBoss(1);
        await txn.wait();
    }

    txn = await gameContract.getActiveSageBoss();
    console.log("Active Sage Boss:", txn);

    txn = await gameContract.getPlayableSages();
    console.log("Playable Sages:", txn);

    txn = await gameContract.getOwnedSageNFTs();
    console.log("Owned Sage NFTs:", txn);

    let balance = await hre.ethers.provider.getBalance(gameContract.address);
    console.log("Contract Balance:", balance);
    balance = await hre.ethers.provider.getBalance(owner.address);
    console.log("Owner balance:", balance);

    await gameContract.withdraw();
    balance = await hre.ethers.provider.getBalance(owner.address);
    console.log("Owner balance:", balance);

    balance = await hre.ethers.provider.getBalance(gameContract.address);
    console.log("Contract Balance:", balance);

    await gameContract.updateSagePrice(0, hre.ethers.utils.parseEther("420.0"));
    txn = await gameContract.getPlayableSages();
    console.log("Playable Sages:", txn);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();