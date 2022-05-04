import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS } from "../../utils/constants";
import { transformCharacterData } from "../../utils/helpers";
import sageGame from '../../utils/SageGame.json';
import LoadingIndicator from "../LoadingIndicator";
import './Arena.css';

const Arena = ({ characterNFTs, setCharacterNFTs }) => {
    const [gameContract, setGameContract] = useState(null);
    const [healPrice, setHealPrice] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState('');
    const [toastState, setToastState] = useState({ showToast: false, attackDamage: null });

    const attackBoss = async (attackingSage) => {
        try {
            if (gameContract) {
                setAttackState("attacking");
                console.log("Attacking boss!");
                const attackTxn = await gameContract.attackBoss(attackingSage.tokenId);
                await attackTxn.wait();
                console.log("Attack txn:", attackTxn);
                setAttackState("hit");

                setToastState({ showToast: true, attackDamage: attackingSage.attackDamage });
                setTimeout(() => {
                    setToastState({ showToast: false, attackDamage: null });
                }, 5000);
            }
        } catch (error) {
            console.log("Error attacking Sage Boss!", error);
            setAttackState('');
        }
    };

    const healSage = async (sageId) => {
        try {
            if (gameContract) {
                console.log("Healing Sage");
                const healTxn = await gameContract.healSage(sageId, { value: healPrice });
                await healTxn.wait();
                console.log("Heal txn:", healTxn);
            }
        }   catch (error) {
            console.log("Error healing Sage:", error);
        }
    }

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
        } else {
            console.log('Ethereum object not found');
        }
    }, []);

    useEffect(() => {
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getActiveSageBoss();
            console.log("Boss Sage:", bossTxn);
            setBoss(transformCharacterData(bossTxn));
        };

        const getHealPrice = async () => {
            const healingPrice = await gameContract.getHealingPrice();
            console.log("Healing price:", healingPrice);
            setHealPrice(healingPrice.toBigInt());
        }

        const onAttackComplete = async (newBossHp, playerTokenId, newPlayerHp) => {
            const bossHp = newBossHp.toNumber();
            const tokenId = playerTokenId.toNumber();
            const playerHp = newPlayerHp.toNumber();
            console.log(`AttackComplete: Boss Hp: ${bossHp}  Player Token ID: ${tokenId} Player Hp: ${playerHp}`);

            setBoss((prevState) => {
                return { ...prevState, hp: bossHp };
            });

            setCharacterNFTs((prevState) => {
                return prevState.map((prevCharNft) => {
                    return tokenId === prevCharNft.tokenId
                        ? { ...prevCharNft, hp: playerHp}
                        : prevCharNft;
                });
            });
            // setCharacterNFTs((prevState) => {
            //     return { ...prevState, hp: playerHp };
            // });
        };

        if (gameContract) {
            fetchBoss();
            getHealPrice();
            gameContract.on('AttackComplete', onAttackComplete);
        }

        return () => {
            if (gameContract) {
                gameContract.off('AttackComplete', onAttackComplete);
            }
        }
    }, [gameContract]);

    return (
        <div className="arena-container">
            {boss && characterNFTs.length > 0 && (
                <div id="toast" className={toastState.showToast ? 'show' : ''}>
                    <div id="desc">{`🐾 ${boss.name} was hit for ${toastState.attackDamage}!`}</div>
                </div>
            )}

            {boss && (
                <div className="boss-container">
                    <div className={`boss-content ${attackState}`}>
                        <h2>😾 {boss.name} 😾</h2>
                        <div className="image-content">
                            <img src={boss.imageURI} alt={`Boss Sage ${boss.name}`} />
                            <div className="health-bar">
                                <progress value={boss.hp} max={boss.maxHp} />
                                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                            </div>
                        </div>
                    </div>
                    {attackState === "attacking" && (
                        <div className="loading-indicator">
                            <LoadingIndicator />
                            <p>Attacking 🐾️</p>
                        </div>
                    )}
                </div>
            )}

            {characterNFTs.length > 0 && (
                <div>
                    <h2>Your Sages</h2>
                    <div className="players-container">
                        {characterNFTs.map(characterNFT => {
                            return (
                                <div className="player-content">
                                    <div className="player" key={characterNFT.tokenId}>
                                        <div className="image-content">
                                            <h2>{characterNFT.name}</h2>
                                            <img src={characterNFT.imageURI} alt={`Sage: ${characterNFT.name}`} />
                                            <div className="health-bar">
                                                <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                                                <p>{`${characterNFT.hp} / ${characterNFT.maxHp}`}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4>{`🐾️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
                                            <div className="attack-container">
                                                <button className="cta-button" onClick={() => attackBoss(characterNFT)}>
                                                    {`🐾 Attack ${boss.name}`}
                                                </button>
                                                <button className="cta-button" onClick={() => healSage(characterNFT.tokenId)}>
                                                    {`🐾 Heal ${characterNFT.name} for ${ethers.utils.formatUnits(characterNFT.price, 'ether')} ether`}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Arena;