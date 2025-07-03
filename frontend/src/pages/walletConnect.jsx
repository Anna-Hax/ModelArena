import React, { useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from '../context/WalletContext';
import axios from 'axios';

const ConnectWallet = () => {
  const navigate = useNavigate();
  const { connectWallet, disconnectWallet, address, isConnected } = useWallet();
  localStorage.setItem('wallet_connect', false)
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
          localStorage.setItem("wallet_connect", "true");
          console.log("✅ Wallet address saved:", res.data);
          navigate("/home");
        } catch (err) {
          console.error("❌ Failed to save wallet address:", err);
        }
      }
    };

    postWallet();
  }, [isConnected, address, navigate]);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#1e003e] via-[#2d005f] to-[#44007e] text-white flex items-center justify-center">
      <div className="bg-purple-700 rounded-xl shadow-lg p-8 w-full max-w-md text-center space-y-6">
        <h2 className="text-3xl font-bold">🔗 Connect Your Wallet</h2>
        <p className="text-sm text-purple-200">
          Securely connect your wallet to start earning rewards
        </p>

        {/* Info Box */}
        <div className="bg-purple-800 rounded-lg p-4 text-left space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-lg">🛡️</span>
            <div>
              <p className="font-semibold">Bank-Level Security</p>
              <p className="text-sm text-purple-300">Your keys, your coins</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 text-lg">⚡</span>
            <div>
              <p className="font-semibold">Instant Transactions</p>
              <p className="text-sm text-purple-300">Fast reward payments</p>
            </div>
          </div>
        </div>

        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 transition rounded-lg shadow font-semibold"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-green-300 font-semibold">✅ Wallet Connected</p>
            <p className="break-words text-sm"><strong>Address:</strong> {address}</p>
            <button
              onClick={disconnectWallet}
              className="w-full py-2 bg-red-500 hover:bg-red-600 transition rounded-lg"
            >
              Disconnect
            </button>
          </div>
        )}

        <p className="text-xs text-purple-300 mt-4">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
          Your wallet information is never stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default ConnectWallet;
