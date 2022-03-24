import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import './App.css';
import sageGif from './assets/sage-yawn.gif';
import twitterLogo from './assets/twitter-logo.svg';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS } from "./utils/constants";
import { transformCharacterData } from "./utils/helpers";
import sageGame from './utils/SageGame.json';
import Arena from './Components/Arena';
import LoadingIndicator from "./Components/LoadingIndicator";

// Constants
const TWITTER_HANDLE = 'bgsamz';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have MetaMask installed!");
        setIsLoading(false);
        return;
      } else {
        console.log("Ethereum object found.");

        const accounts = await ethereum.request({method: 'eth_accounts'});
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No authorized accounts found.");
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const checkNetwork = async () => {
    try {
      let chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x4') {
        alert("Please connect to Rinkeby!")
      }
    } catch(error) {
      console.log(error)
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask to continue!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Connected!", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src={sageGif}
            alt="Sage Yawning Gif"
          />
          <button className="cta-button connect-wallet-button" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
    checkNetwork();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log("getting contract", CONTRACT_ADDRESS);
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        sageGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has Sage NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No Sage NFT found');
      }

      setIsLoading(false);
    }

    if (currentAccount) {
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">🐈‍⬛ Sage Tamer 🐈‍⬛</p>
          <p className="sub-text">Team up to tame all the Sages!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`@${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
