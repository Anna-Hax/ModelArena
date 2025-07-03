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
  const [showPredictions, setShowPredictions] = useState(false);
  const [predictionStartTime, setPredictionStartTime] = useState(null);
  const [renderKey, setRenderKey] = useState(null);
  const [isRunningPredictions, setIsRunningPredictions] = useState(false);

  const navigate = useNavigate();

  // Initial load - fetch model info without running predictions
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const access = localStorage.getItem("access");
        const [modelsRes, titleRes] = await Promise.all([
          axios.post(
            "http://localhost:8000/prediction/run-prediction/",
            { only_model_info: true }, // Flag to only get model info
            { headers: { Authorization: `Bearer ${access}` } }
          ),
          axios.get("http://localhost:8000/hackathon/status/"),
        ]);

        // Extract only basic model info (uploader and file name)
        const basicModels = modelsRes.data.results.map(model => ({
          uploaded_by: model.uploaded_by,
          model_file: model.model_file,
          reward_token: model.reward_token || 0
        }));
        
        setModels(basicModels);
        setHackathonTitle(titleRes.data.title);
      } catch (err) {
        console.error("🔴 Initial data fetch failed:", err);
        setError("Failed to fetch model list or hackathon title.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Blockchain data fetching
  useEffect(() => {
    const fetchOnChainData = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = await getArenaContract();
        const counter = await contract.hackathonCounter();
        const currentHackathonId = counter.toNumber() - 1;

        if (currentHackathonId < 0) return;

        const players = await contract.getPlayers(currentHackathonId);
        const contractBalance = await provider.getBalance(contract.address);

        setParticipants(players);
        setPrizePool(ethers.utils.formatEther(contractBalance));
      } catch (err) {
        console.error("🔴 Blockchain fetch failed:", err);
        setError("Failed to fetch blockchain data.");
      }
    };

    fetchOnChainData();
    const interval = setInterval(fetchOnChainData, 15000);
    return () => clearInterval(interval);
  }, []);

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
          value: ethers.utils.parseEther("1.0"),
        });
        await tx.wait();
        console.log("💰 Prize pool updated for existing participant.");
      } else {
        const tx = await contract.joinHackathon(hackathonId, {
          value: ethers.utils.parseEther("1.0"),
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

  // Get Predictions - runs the full prediction logic
  const handleGetPredictions = async () => {
    setIsRunningPredictions(true);
    try {
      const access = localStorage.getItem("access");
      const predRes = await axios.post(
        "http://localhost:8000/prediction/run-prediction/",
        {},
        { headers: { Authorization: `Bearer ${access}` } }
      );

      // Update models with prediction results
      setModels(predRes.data.results);
      const currentTime = new Date().toISOString();
      setShowPredictions(true);
      setPredictionStartTime(currentTime);
      setRenderKey(Date.now());
    } catch (err) {
      console.error("🔴 Prediction fetch failed:", err);
      setError("Failed to run predictions. Please try again.");
    } finally {
      setIsRunningPredictions(false);
    }
  };

  if (loading) return <div>⏳ Loading models...</div>;
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
          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded mr-4"
        >
          {isUploading ? "Processing..." : "📤 Upload Model (1 ETH)"}
        </button>
        
        {/* Get Predictions button - always visible */}
        <button
          onClick={handleGetPredictions}
          disabled={isRunningPredictions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isRunningPredictions ? "🔄 Running Predictions..." : "📊 Get Predictions"}
        </button>
        
        {txError && <p className="text-red-600 mt-2">{txError}</p>}
      </div>

      <h3 className="text-xl font-semibold mt-4">📊 Models</h3>
      {models.length === 0 ? (
        <p>No models found.</p>
      ) : (
        <div className="model-grid">
          {models.map((model, index) => (
            <div
              key={index}
              className="model-card border p-4 rounded-lg shadow-md my-3 bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">Uploader: {model.uploaded_by}</h3>
                  <p><strong>Model File:</strong> {model.model_file}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    🏆 {model.reward_token || 0} tokens
                  </span>
                </div>
              </div>

              {/* Show predictions only after Get Predictions is clicked */}
              {showPredictions && model.predictions && predictionStartTime && (
                <div className="mt-4">
                  <h4 className="font-semibold text-md mb-2">🎯 Predictions:</h4>
                  <CountdownTimer
                    key={`5min-${renderKey}-${index}`}
                    label="+5 min"
                    prediction={model.predictions["+5min"]}
                    actual={model.actual_5}
                    baseTime={predictionStartTime}
                    delayMinutes={5}
                  />
                  <CountdownTimer
                    key={`10min-${renderKey}-${index}`}
                    label="+10 min"
                    prediction={model.predictions["+10min"]}
                    actual={model.actual_10}
                    baseTime={predictionStartTime}
                    delayMinutes={10}
                  />
                  <CountdownTimer
                    key={`15min-${renderKey}-${index}`}
                    label="+15 min"
                    prediction={model.predictions["+15min"]}
                    actual={model.actual_15}
                    baseTime={predictionStartTime}
                    delayMinutes={15}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;