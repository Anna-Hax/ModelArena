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
  // eslint-disable-next-line no-unused-vars
  const [isUploading, setIsUploading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [txError, setTxError] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const [predictionStartTime, setPredictionStartTime] = useState(null);
  const [renderKey, setRenderKey] = useState(null);
  const [isRunningPredictions, setIsRunningPredictions] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const access = localStorage.getItem("access");
        const [modelsRes, titleRes] = await Promise.all([
          axios.post(
            "http://localhost:8000/prediction/run-prediction/",
            { only_model_info: true },
            { headers: { Authorization: `Bearer ${access}` } }
          ),
          axios.get("http://localhost:8000/hackathon/status/"),
        ]);

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

  const handleGetPredictions = async () => {
    setIsRunningPredictions(true);
    try {
      const access = localStorage.getItem("access");
      const predRes = await axios.post(
        "http://localhost:8000/prediction/run-prediction/",
        {},
        { headers: { Authorization: `Bearer ${access}` } }
      );

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

  if (loading) return <div className="text-white text-center">⏳ Loading models...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
  <div className="w-screen h-screen bg-gradient-to-br from-[#1e003e] via-[#2d005f] to-[#44007e] text-white">
  <h2 className="text-4xl font-bold text-purple-400 mb-8 text-center">
    🚀 {hackathonTitle || "Hackathon Overview"}
  </h2>

  {/* Arena Stats */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
    <div className="bg-gradient-to-br from-purple-700 to-indigo-700 p-6 rounded-2xl shadow-lg hover:shadow-purple-900 transition duration-300">
      <h4 className="text-lg font-semibold text-white mb-2">🏆 Prize Pool</h4>
      <p className="text-3xl font-bold text-green-300">{prizePool} ETH</p>
    </div>
    <div className="bg-gradient-to-br from-pink-700 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-pink-900 transition duration-300">
      <h4 className="text-lg font-semibold text-white mb-2">👥 Participants</h4>
      <p className="text-3xl font-bold text-yellow-300">{participants.length}</p>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
    <button
      onClick={handleUploadModelPayment}
      disabled={isUploading}
      className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-lg px-8 py-3 rounded-xl shadow-lg transition duration-300"
    >
      {isUploading ? "Processing..." : "📤 Upload Model (1 ETH)"}
    </button>

    <button
      onClick={handleGetPredictions}
      disabled={isRunningPredictions}
      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-lg px-8 py-3 rounded-xl shadow-lg transition duration-300"
    >
      {isRunningPredictions ? "🔄 Running Predictions..." : "📊 Get Predictions"}
    </button>
  </div>

  {txError && (
    <p className="text-center text-red-400 mb-6">{txError}</p>
  )}

  {/* Submitted Models */}
  <h3 className="text-3xl font-semibold mb-6 text-center">📈 Submitted Models</h3>

  {models.length === 0 ? (
    <p className="text-center text-gray-300">No models submitted yet.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {models.map((model, index) => (
        <div
          key={index}
          className="bg-[#1f0033] border border-purple-800 p-6 rounded-2xl shadow-md hover:shadow-purple-800 transition duration-300"
        >
          <div className="mb-4">
            <h4 className="text-xl font-bold text-purple-300 mb-1">Uploader: {model.uploaded_by}</h4>
            <p className="text-sm text-gray-400 truncate">📦 {model.model_file}</p>
            <p className="text-yellow-400 font-semibold mt-3">🏆 {model.reward_token} Tokens</p>
          </div>

          {showPredictions && model.predictions && predictionStartTime && (
            <div>
              <h5 className="text-md text-white font-semibold mb-2">🎯 Live Predictions</h5>
              <div className="space-y-2">
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
