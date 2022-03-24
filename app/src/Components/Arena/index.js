import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS } from "../../utils/constants";
import { transformCharacterData } from "../../utils/helpers";
import sageGame from '../../utils/SageGame.json';
import LoadingIndicator from "../LoadingIndicator";
import './Arena.css';

const Arena = ({ characterNFT, setCharacterNFT }) => {
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState('');
    const [showToast, setShowToast] = useState(false);

    const attackBoss = async () => {
        try {
            if (gameContract) {
                setAttackState("attacking");
                console.log("Attacking boss!");
                const attackTxn = await gameContract.attackBoss();
                await attackTxn.wait();
                console.log("Attack txn:", attackTxn);
                setAttackState("hit");

                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        } catch (error) {
            console.log("Error attacking Sage Boss!", error);
            setAttackState('');
        }
    };

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

        const onAttackComplete = async (newBossHp, newPlayerHp) => {
            const bossHp = newBossHp.toNumber();
            const playerHp = newPlayerHp.toNumber();
            console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

            setBoss((prevState) => {
                return { ...prevState, hp: bossHp };
            });

            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHp };
            });
        };

        if (gameContract) {
            fetchBoss();
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
            {boss && characterNFT && (
                <div id="toast" className={showToast ? 'show' : ''}>
                    <div id="desc">{`🐾 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
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
                    <div className="attack-container">
                        <button className="cta-button" onClick={attackBoss}>
                            {`🐾 Attack ${boss.name}`}
                        </button>
                    </div>
                    {attackState === "attacking" && (
                        <div className="loading-indicator">
                            <LoadingIndicator />
                            <p>Attacking 🐾️</p>
                        </div>
                    )}
                </div>
            )}

            {characterNFT && (
                <div className="players-container">
                    <div className="player-content">
                        <h2>Your Sage</h2>
                        <div className="player">
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
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Arena;