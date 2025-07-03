import { createContext, useContext, useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import * as ethers from 'ethers'; // ✅ safest
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

const WalletContext = createContext();

const PROVIDER_OPTIONS = {
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: 'ModelArena',
      infuraId: '8fab9438dc5f4e3e9a169113dcda10e3',
    },
  },
};

export const WalletProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const restoreWallet = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const walletAddress = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAddress(walletAddress);
        setIsConnected(true);
      }
    };

    restoreWallet();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', restoreWallet);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: PROVIDER_OPTIONS,
      });

      const instance = await web3Modal.connect();
      const web3Provider = new ethers.utils.BrowserProvider(instance); // ✅ v6
      const signer = await web3Provider.getSigner();
      const walletAddress = await signer.getAddress();

      setProvider(web3Provider);
      setSigner(signer);
      setAddress(walletAddress);
      setIsConnected(true);
    } catch (err) {
      console.error('Wallet connection error:', err);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
  };

  return (
    <WalletContext.Provider
      value={{
        provider,
        signer,
        address,
        isConnected,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
