import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import { getArenaContract } from "../utils/contract";

const ModelUpload = () => {
  const [file, setFile] = useState(null);
  const [paying, setPaying] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [txError, setTxError] = useState("");
  const [hackathonStatus, setHackathonStatus] = useState(null);
  const [hackathonTitle, setHackathonTitle] = useState("");
  const [isHackathonActive, setIsHackathonActive] = useState(false);
  const [currentHackathonId, setCurrentHackathonId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [prizePool, setPrizePool] = useState("0");
  const [error, setError] = useState("");

  const access = localStorage.getItem("access");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    const fetchHackathonStatus = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/hackathon/status/`
        );
        const data = response.data;

        if (data.status === "ongoing") {
          setHackathonStatus("ongoing");
          setHackathonTitle(data.title);
          setIsHackathonActive(true);
          if (data.hackathon_id) {
            setCurrentHackathonId(data.hackathon_id);
          }
        } else {
          setHackathonStatus(data.status);
          setHackathonTitle(data.title || "Hackathon");
          setIsHackathonActive(false);
        }
      } catch (err) {
        console.error("🔴 Failed to fetch hackathon status:", err);
        setError("Failed to fetch hackathon status.");
        setHackathonStatus("not_found");
        setIsHackathonActive(false);
      }
    };

    fetchHackathonStatus();
    const interval = setInterval(fetchHackathonStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initial fetch of on-chain data when component mounts or hackathon ID changes
  useEffect(() => {
    if (currentHackathonId !== null) {
      fetchOnChainData();
    }
  }, [currentHackathonId]);

  const fetchOnChainData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = await getArenaContract();

      let hackathonId = currentHackathonId;

      if (hackathonId === null) {
        const counter = await contract.hackathonCounter();
        hackathonId = counter.toNumber() - 1;
        setCurrentHackathonId(hackathonId);
      }

      if (hackathonId < 0) {
        setParticipants([]);
        setPrizePool("0");
        return;
      }

      const players = await contract.getPlayers(hackathonId);
      const details = await contract.hackathons(hackathonId);

      const prizePoolInEth = ethers.utils.formatEther(details.prizePool || 0);
      setPrizePool(prizePoolInEth);
      setParticipants(players);
      
      console.log("✅ Updated prize pool:", prizePoolInEth, "ETH");
      console.log("✅ Updated participants:", players.length);
    } catch (err) {
      console.error("🔴 Blockchain fetch failed:", err);
      setError("Failed to fetch blockchain data.");
    }
  };

  const handleUploadModelPayment = async () => {
    if (!isHackathonActive) return false;

    try {
      setIsJoining(true);
      setTxError("");

      if (!window.ethereum)
        throw new Error("MetaMask is required to upload model");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 11155111) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      }

      const signer = provider.getSigner();
      const contract = await getArenaContract(signer);

      // Send ETH directly to contract address to add to prize pool
      // This will trigger the receive() function in the smart contract
      const tx = await signer.sendTransaction({
        to: contract.address,
        value: ethers.utils.parseEther("0.0001"),
        gasLimit: 100000,
      });

      console.log("🔄 Transaction sent:", tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt.transactionHash);

      // IMPORTANT: Wait a bit longer for blockchain state to update
      console.log("⏳ Waiting for blockchain state to update...");
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

      // Refresh the on-chain data to update prize pool AND participants
      await fetchOnChainData();

      return true;
    } catch (err) {
      console.error("Payment failed:", err);

      if (err.message.includes("user rejected")) {
        setTxError("❌ Transaction was rejected by user.");
      } else if (err.message.includes("insufficient funds")) {
        setTxError("❌ Insufficient funds for model upload.");
      } else if (err.message.includes("MetaMask")) {
        setTxError("❌ MetaMask is required to upload model.");
      } else {
        setTxError(`❌ Payment failed: ${err.message}`);
      }
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  const handleUpload = async () => {
    const paid = await handleUploadModelPayment();

    if (paid) {
      if (!file) {
        alert("Please select a file to upload.");
        return;
      }

      const formData = new FormData();
      formData.append("model", file);

      try {
        const response = await fetch("http://localhost:8000/model/", {
          method: "POST",
          headers: { Authorization: `Bearer ${access}` },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log("Upload success:", data);
        
        // IMPORTANT: Fetch updated blockchain data after successful upload
        console.log("⏳ Fetching updated blockchain data...");
        await fetchOnChainData();
        
        // Add a small delay before navigation to ensure state updates
        console.log("⏳ Preparing to navigate to home...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate with a state parameter to force refresh
        navigate("/home", { replace: true, state: { forceRefresh: true } });
      } catch (error) {
        console.error("Error during upload:", error);
        alert("Upload failed.");
      }
    } else {
      alert("Payment required before upload!");
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#1e003e] via-[#2d005f] to-[#44007e] flex flex-col items-center justify-center text-white px-6">
      <h2 className="text-3xl font-bold text-purple-300 mb-2">
        🧠 Upload Your Battle-Ready Model
      </h2>
      <p className="text-gray-300 mb-6 text-center">
        Upload a <code>.zip</code> file containing <code>train.py</code>,{" "}
        <code>model.py</code>, and <code>requirements.txt</code>
      </p>

      {/* Display current hackathon info */}
      {isHackathonActive && (
        <div className="bg-gradient-to-br from-purple-800 to-[#310041] border border-purple-400 rounded-xl px-6 py-4 mb-6 w-full max-w-xl">
          <h3 className="text-lg font-semibold text-purple-200 mb-2">
            🏆 Current Hackathon
          </h3>
          <p className="text-gray-300 mb-2">{hackathonTitle}</p>
          <div className="flex justify-between text-sm">
            <span className="text-green-300">Prize Pool: {prizePool} ETH</span>
            <span className="text-blue-300">Participants: {participants.length}</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-purple-900 to-[#310041] border border-purple-500 rounded-xl px-6 py-4 mb-8 w-full max-w-xl font-mono text-green-300 text-sm shadow-md">
        <p className="mb-1">user_upload.zip</p>
        <p className="ml-4">
          ├── <span className="text-white">train.py</span>{" "}
          <span className="text-gray-400"># Training logic</span>
        </p>
        <p className="ml-4">
          ├── <span className="text-white">model.py</span>{" "}
          <span className="text-gray-400"># Prediction class</span>
        </p>
        <p className="ml-4">
          └── <span className="text-white">requirements.txt</span>{" "}
          <span className="text-gray-400"># Dependencies</span>
        </p>

        <p className="ml-4">
          └── <span className="text-white">model.pkl</span>{" "}
          <span className="text-gray-400"># Dependencies</span>
        </p>
      </div>

      <input
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="bg-[#2d004b] text-white px-4 py-2 rounded-lg shadow-md mb-6 cursor-pointer w-full max-w-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"
      />

      <button
        onClick={handleUpload}
        disabled={isJoining || paying || !isHackathonActive}
        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-300"
      >
        {isJoining ? "⏳ Processing..." : "🚀 Upload Model File"}
      </button>

      {!isHackathonActive && (
        <p className="text-yellow-400 mt-4 text-sm">
          ⚠️ No active hackathon. Model upload is currently disabled.
        </p>
      )}

      {txError && <p className="text-red-400 mt-4">{txError}</p>}
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

export default ModelUpload;