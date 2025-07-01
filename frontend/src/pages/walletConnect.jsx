import { useState, useCallback } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { createCoinbaseWalletSDK } from '@coinbase/wallet-sdk';

const PROVIDER_OPTIONS = {
  coinbasewallet: {
    package: createCoinbaseWalletSDK,
    options: {
      appName: 'coinbase',
      infuraId: { 3: 'https://ropsten.infuria.io/v3/fefnefnesfe' }
    }
  }
};

const Wallet = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [provider, setProvider] = useState(null);

  const connectWallet = useCallback(async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions: PROVIDER_OPTIONS,
      });
      
      const web3ModalInstance = await web3Modal.connect();
      const web3ModalProvider = new ethers.providers.Web3Provider(web3ModalInstance);
      
      setProvider(web3ModalProvider);
      setIsConnected(true);
      alert('Wallet connected');
      
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setIsConnected(false);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Web3Modal Connection</h1>
        
        {!isConnected ? (
          <button 
            onClick={connectWallet} 
            disabled={isConnecting}
            aria-label="Connect your cryptocurrency wallet"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div>
            <p>✅ Wallet Connected</p>
            <button 
              onClick={disconnectWallet}
              aria-label="Disconnect your cryptocurrency wallet"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </header>
    </div>
  );
};

export default Wallet;