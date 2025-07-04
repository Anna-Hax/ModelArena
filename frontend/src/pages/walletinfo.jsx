import React, { useState } from 'react';
import * as ethers from 'ethers';
import { useWallet } from '../context/WalletContext';

const SendEtherPage = () => {
  const { signer, address, isConnected } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');

  const sendTransaction = async () => {
    if (!recipient || !amount) {
      alert('Please fill all fields.');
      return;
    }

    try {
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });
      setTxHash(tx.hash);
      alert('Transaction sent! Hash: ' + tx.hash);
    } catch (err) {
      console.error(err);
      alert('Transaction failed.');
    }
  };

  if (!isConnected) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#1a103d] to-[#291755] text-white text-xl">
        <p>Please connect your wallet first.</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#1a103d] to-[#291755] text-white px-4">
      <div className="w-full max-w-md bg-[#1F1A3B] p-8 rounded-3xl shadow-xl border border-[#6B1AFF]">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#FF477E]">💸 Send ETH</h2>

        <div className="text-sm mb-4 text-[#21E6C1]">
          Connected Wallet:
          <div className="font-mono text-white break-all">{address}</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-2 text-[#C0C0FF]">Recipient Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#291755] border border-[#6B1AFF] text-white placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#FF477E]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2 text-[#C0C0FF]">Amount (ETH)</label>
          <input
            type="number"
            placeholder="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#291755] border border-[#6B1AFF] text-white placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#FF477E]"
          />
        </div>

        <button
          onClick={sendTransaction}
          className="w-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-[#C850C0] to-[#FF477E] rounded-lg hover:opacity-90 transition"
        >
          🚀 Send ETH
        </button>

        {txHash && (
          <p className="mt-6 text-sm text-green-400 break-all">
            ✅ Transaction Hash: <span className="font-mono">{txHash}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SendEtherPage;