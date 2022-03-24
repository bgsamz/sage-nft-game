import { ethers } from "ethers";
import React, { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS } from "../../utils/constants";
import { transformCharacterData } from "../../utils/helpers";
import sageGame from '../../utils/SageGame.json';
import './SelectCharacter.css';
import LoadingIndicator from "../LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [mintingCharacter, setMintingCharacter] = useState(false);

    const mintCharacterNFT = async (characterId) => {
        try {
            if (gameContract) {
                setMintingCharacter(true);
                console.log("Minting a new Sage!");
                const mintTxn = await gameContract.mintSageNft(characterId);
                await mintTxn.wait();
                console.log("Minted new Sage:", mintTxn);
            }
        } catch (error) {
            console.log("Error while minting Sage:", error);
        }
        setMintingCharacter(false);
    };

    const renderCharacters = () => characters.map((char, idx) => (
        <div className="character-item" key={char.name}>
            <div className="name-container">
                <p>{char.name}</p>
            </div>
            <img src={char.imageURI} alt={char.name} />
            <button
                type="button"
                className="character-mint-button"
                onClick={()=> mintCharacterNFT(idx)}
            >{`Mint ${char.name}`}</button>
        </div>
    ));

    useEffect(() => {
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                sageGame.abi,
                signer
            );

            setGameContract(gameContract);
        }
    }, []);

    useEffect(() => {
        const getCharacters = async () => {
            try {
                console.log("Getting all characters available to mint!");
                const charactersTxn = await gameContract.getAllDefaultSages();
                console.log('charactersTxn:', charactersTxn);

                const allCharacters = charactersTxn.map((charData) => transformCharacterData(charData));
                setCharacters(allCharacters);
            } catch (error) {
                console.log(error);
            }
        };

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`);

            if (gameContract) {
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log('CharacterNFT: ', characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));
                alert(`Sage NFT minted! See it here: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
            }
        };

        if (gameContract) {
            getCharacters();
            gameContract.on('SageNFTMinted', onCharacterMint);
        }

        return () => {
            if (gameContract) {
                gameContract.off('SageNFTMinted', onCharacterMint);
            }
        };
    }, [gameContract]);

    return (
        <div className="select-character-container">
            <h2>Mint Your Sage. Choose wisely.</h2>
            {characters.length > 0 && (
                <div className='character-grid'>{renderCharacters()}</div>
            )}
            {mintingCharacter && (
                <div className="loading">
                    <div className="indicator">
                        <LoadingIndicator />
                        <p>Minting Sage in progress!</p>
                    </div>
                    <img
                        // TODO get a different GIF
                        src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
                        alt="Minting loading indicator"
                    />
                </div>
            )}
        </div>
    );
};

export default SelectCharacter;