const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory('SageGame');
    const pointOneEther = hre.ethers.utils.parseEther("0.1");
    const healingPrice = hre.ethers.utils.parseEther("0.01");
    const gameContract = await gameContractFactory.deploy(
        ["Snowy Sage", "Armored Sage", "Sleepy Sage"], // Names
        [
            "https://i.imgur.com/j9R2sQh.jpg", // SnowySage
            "https://i.imgur.com/73RBJmN.jpg", // ArmoredSage
            "https://i.imgur.com/4KMzpDq.jpg", // SleepySage
        ],
        [75, 100, 25], // HP
        [100, 25, 25], // Attack
        [pointOneEther, pointOneEther, pointOneEther],
        healingPrice
    );
    await gameContract.deployed();
    console.log("Contract deployed to:", gameContract.address);

    let txn;
    txn = await gameContract.spawnBoss("Stretchy Sage",
                                       "https://i.imgur.com/vAZVX3b.jpg",
                                       1000,
                                       15,
                                       hre.ethers.utils.parseEther("1.0"));
    await txn.wait();
    console.log("Boss initialized!")

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