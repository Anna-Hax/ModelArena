import React, { useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import axios from 'axios';

const ConnectWallet = () => {
  const { connectWallet, disconnectWallet, address, isConnected } = useWallet();

  // 🧠 POST wallet address to backend once connected
  useEffect(() => {
    const postWallet = async () => {
      if (isConnected && address) {
        try {
          const access = localStorage.getItem('access');

          const res = await axios.post(
            'http://localhost:8000/auth/save-wallet/',
            { wallet_address: address },
            {
              headers: {
                Authorization: `Bearer ${access}`,
              },
            }
          );

          console.log("✅ Wallet address saved:", res.data);
        } catch (err) {
          console.error("❌ Failed to save wallet address:", err);
        }
      }
    };

    postWallet();
  }, [isConnected, address]);

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
