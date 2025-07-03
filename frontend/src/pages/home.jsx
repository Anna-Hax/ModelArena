import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { getArenaContract } from "../utils/contract";
import CountdownTimer from "../components/Counter";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [models, setModels] = useState([]);
  const [hackathonTitle, setHackathonTitle] = useState("");
  const [participants, setParticipants] = useState([]);
  const [prizePool, setPrizePool] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [txError, setTxError] = useState("");

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const access = localStorage.getItem("access");

        const [predRes, titleRes] = await Promise.all([
          axios.post(
            "http://localhost:8000/prediction/run-prediction/",
            {},
            { headers: { Authorization: `Bearer ${access}` } }
          ),
          axios.get("http://localhost:8000/hackathon/status/")
        ]);

        setModels(predRes.data.results);
        setHackathonTitle(titleRes.data.title);
      } catch (err) {
        console.error("🔴 Django fetch failed:", err);
        setError("Failed to fetch predictions or title.");
      }
    };

    fetchBackendData();
  }, []);

  useEffect(() => {
    const fetchOnChainData = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = await getArenaContract();

        const counter = await contract.hackathonCounter();
        const currentHackathonId = counter.toNumber() - 1;

        if (currentHackathonId < 0) {
          console.warn("No hackathon created yet.");
          return;
        }

        const players = await contract.getPlayers(currentHackathonId);
        const contractBalance = await provider.getBalance(contract.address);

        setParticipants(players);
        setPrizePool(ethers.utils.formatEther(contractBalance));
      } catch (err) {
        console.error("🔴 Blockchain fetch failed:", err);
        setError("Failed to fetch blockchain data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOnChainData();

    const interval = setInterval(fetchOnChainData, 15000);
    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();

  const handleUploadModelPayment = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      const contract = await getArenaContract(signer);
      const counter = await contract.hackathonCounter();
      const hackathonId = counter.toNumber() - 1;

      const players = await contract.getPlayers(hackathonId);
      const alreadyJoined = players.some(
        (addr) => addr.toLowerCase() === userAddress.toLowerCase()
      );

      if (alreadyJoined) {
        const tx = await signer.sendTransaction({
          to: contract.address,
          value: ethers.utils.parseEther("1.0")
        });
        await tx.wait();
        console.log("💰 Prize pool updated for existing participant.");
      } else {
        const tx = await contract.joinHackathon(hackathonId, {
          value: ethers.utils.parseEther("1.0")
        });
        await tx.wait();
        console.log("✅ Joined and paid.");
      }

      navigate("/UploadModel");
    } catch (err) {
      console.error("Join/Pay failed:", err);
      alert("❌ Something went wrong. Check console.");
    }
  };

  if (loading) return <div>⏳ Loading predictions...</div>;
  if (error) return <div>❌ {error}</div>;

  return (
    <div className="home-container">
      <h2>🚀 {hackathonTitle || "Hackathon"}</h2>

      <div className="text-md text-gray-700 mb-4">
        <p>🏆 Prize Pool: <strong>{prizePool} ETH</strong></p>
        <p>👥 Participants: <strong>{participants.length}</strong></p>
      </div>

      <div className="mb-4">
        <button
          onClick={handleUploadModelPayment}
          disabled={isUploading}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
        >
          {isUploading ? "Processing..." : "📤 Upload Model (1 ETH)"}
        </button>
        {txError && <p className="text-red-600 mt-2">{txError}</p>}
      </div>

      <h3 className="text-xl font-semibold mt-4">📊 Model Predictions</h3>
      {models.length === 0 ? (
        <p>No models found.</p>
      ) : (
        <div className="model-grid">
          {models.map((model, index) => (
            <div key={index} className="model-card">
              <h3>Uploader: {model.uploaded_by}</h3>
              <p><strong>Model File:</strong> {model.model_file}</p>

              {model.predictions && model.timestamp ? (
                <div className="predictions">
                  <CountdownTimer
                    label="+5 min"
                    prediction={model.predictions["+5min"]}
                    actual={model.actual_5}
                    baseTime={model.timestamp}
                    delayMinutes={5}
                  />
                  <CountdownTimer
                    label="+10 min"
                    prediction={model.predictions["+10min"]}
                    actual={model.actual_10}
                    baseTime={model.timestamp}
                    delayMinutes={10}
                  />
                  <CountdownTimer
                    label="+15 min"
                    prediction={model.predictions["+15min"]}
                    actual={model.actual_15}
                    baseTime={model.timestamp}
                    delayMinutes={15}
                  />
                </div>
              ) : (
                <p className="error-text">❌ Missing predictions or timestamp.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
