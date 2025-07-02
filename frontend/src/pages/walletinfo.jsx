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
    console.log("address", address, "isConnected", isConnected);

    return <p>Please connect your wallet first.</p>;
  }

  return (
    <div>
      <h2>Send ETH</h2>
      <p>Connected Wallet: {address}</p>

      <input
        type="text"
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      /><br /><br />

      <input
        type="number"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      /><br /><br />

      <button onClick={sendTransaction}>Send ETH</button>

      {txHash && <p>Transaction Hash: {txHash}</p>}
    </div>
  );
};

export default SendEtherPage;
