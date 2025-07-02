import React from 'react';
import { useWallet } from '../context/WalletContext';

const ConnectWallet = () => {
  const { connectWallet, disconnectWallet, address, isConnected } = useWallet();
  console.log("address", address, "isConnected", isConnected);


  return (
    <div>
      <h1>Connect Wallet</h1>

      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>✅ Wallet Connected</p>
          <p><strong>Address:</strong> {address}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;

