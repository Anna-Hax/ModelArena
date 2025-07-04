import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/hackathon/status/`);
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
    } catch (err) {
      console.error("🔴 Blockchain fetch failed:", err);
      setError("Failed to fetch blockchain data.");
    }
  };

  const handleUploadModelPayment = async () => {
    if (!isHackathonActive) return;

    try {
      setIsJoining(true);
      setTxError("");

      if (!window.ethereum) throw new Error("MetaMask is required to join the hackathon");

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

      const tx = await signer.sendTransaction({
        to: contract.address,
        value: ethers.utils.parseEther("0.0001"),
        gasLimit: 100000,
      });

      await tx.wait();
      await fetchOnChainData();
      setPaying(true);
    } catch (err) {
      console.error("Join failed:", err);
      setPaying(false);

      if (err.message.includes("user rejected")) {
        setTxError("❌ Transaction was rejected by user.");
      } else if (err.message.includes("insufficient funds")) {
        setTxError("❌ Insufficient funds to join hackathon.");
      } else if (err.message.includes("MetaMask")) {
        setTxError("❌ MetaMask is required to join the hackathon.");
      } else {
        setTxError(`❌ Join failed: ${err.message}`);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleUpload = async () => {
    await handleUploadModelPayment();

    if (paying) {
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
        navigate("/home");
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
        Upload a <code>.zip</code> file containing <code>train.py</code>, <code>model.py</code>, and <code>requirements.txt</code>
      </p>

      <div className="bg-gradient-to-br from-purple-900 to-[#310041] border border-purple-500 rounded-xl px-6 py-4 mb-8 w-full max-w-xl font-mono text-green-300 text-sm shadow-md">
        <p className="mb-1">user_upload.zip</p>
        <p className="ml-4">├── <span className="text-white">train.py</span> <span className="text-gray-400"># Training logic</span></p>
        <p className="ml-4">├── <span className="text-white">model.py</span> <span className="text-gray-400"># Prediction class</span></p>
        <p className="ml-4">└── <span className="text-white">requirements.txt</span> <span className="text-gray-400"># Dependencies</span></p>
      </div>

      <input
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="bg-[#2d004b] text-white px-4 py-2 rounded-lg shadow-md mb-6 cursor-pointer w-full max-w-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"
      />

      <button
        onClick={handleUpload}
        disabled={isJoining || paying}
        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-300"
      >
        🚀 Upload Model File
      </button>

      {txError && <p className="text-red-400 mt-4">{txError}</p>}
    </div>
  );
};

export default ModelUpload;