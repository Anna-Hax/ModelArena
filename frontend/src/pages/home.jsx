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
  const [currentHackathonId, setCurrentHackathonId] = useState(null);
  const [hackathonStatus, setHackathonStatus] = useState(null);
  const [isHackathonActive, setIsHackathonActive] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHackathonStatus = async () => {
      try {
        const response = await axios.get("http://localhost:8000/hackathon/status/");
        if (response.data.status === "ongoing") {
          setHackathonStatus("ongoing");
          setHackathonTitle(response.data.title);
          setIsHackathonActive(true);
          if (response.data.hackathon_id) {
            setCurrentHackathonId(response.data.hackathon_id);
          }
        } else if (response.data.status === "ended") {
          setHackathonStatus("ended");
          setHackathonTitle(response.data.title || "Hackathon");
          setIsHackathonActive(false);
        } else {
          setHackathonStatus("not_found");
          setIsHackathonActive(false);
        }
      } catch (err) {
        setError("Failed to fetch hackathon status.");
        setHackathonStatus("not_found");
        setIsHackathonActive(false);
      }
    };

    fetchHackathonStatus();
    const interval = setInterval(fetchHackathonStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isHackathonActive) return setLoading(false);
    const fetchInitialData = async () => {
      try {
        const access = localStorage.getItem("access");
        const modelsRes = await axios.post(
          "http://localhost:8000/prediction/run-prediction/",
          { only_model_info: true },
          { headers: { Authorization: `Bearer ${access}` } }
        );
        const basicModels = modelsRes.data.results.map(model => ({
          uploaded_by: model.uploaded_by,
          model_file: model.model_file,
          reward_token: model.reward_token || 0,
          predictions: model.predictions,
          actual_5: model.actual_5,
          actual_10: model.actual_10,
          actual_15: model.actual_15
        }));
        setModels(basicModels);
      } catch (err) {
        setError("Failed to fetch model list.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [isHackathonActive]);

  const fetchOnChainData = async () => {
    try {
      // eslint-disable-next-line no-unused-vars
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = await getArenaContract();
      let hackathonId = currentHackathonId ?? (await contract.hackathonCounter()).toNumber() - 1;
      setCurrentHackathonId(hackathonId);

      const players = await contract.getPlayers(hackathonId);
      const hackathonDetails = await contract.hackathons(hackathonId);

      if (hackathonDetails && hackathonDetails.prizePool) {
        const prizePoolInEth = ethers.utils.formatEther(hackathonDetails.prizePool);
        setPrizePool(prizePoolInEth);
      } else {
        setPrizePool((players.length * 0.7).toString());
      }

      setParticipants(players);
    } catch (err) {
      setError("Failed to fetch blockchain data.", err);
    }
  };

  useEffect(() => {
    if (!isHackathonActive) return;
    fetchOnChainData();
    const interval = setInterval(fetchOnChainData, 15000);
    return () => clearInterval(interval);
  }, [isHackathonActive, currentHackathonId]);

  const handleUploadModelPayment = async () => {
    if (!isHackathonActive) return;
    try {
      setIsUploading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = await getArenaContract(signer);

      const tx = await signer.sendTransaction({
        to: contract.address,
        value: ethers.utils.parseEther("1.0"),
        gasLimit: 100000,
      });

      await tx.wait();
      setTimeout(fetchOnChainData, 3000);
      navigate("/UploadModel");
    } catch (err) {
      if (err.message.includes("user rejected")) {
        setTxError("Transaction rejected.");
      } else {
        setTxError("Failed to process payment.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleGetPredictions = async () => {
    if (!isHackathonActive) return;
    setIsRunningPredictions(true);
    try {
      const access = localStorage.getItem("access");
      const predRes = await axios.post(
        "http://localhost:8000/prediction/run-prediction/",
        {},
        { headers: { Authorization: `Bearer ${access}` } }
      );
      setModels(predRes.data.results);
      setPredictionStartTime(new Date().toISOString());
      setShowPredictions(true);
      setRenderKey(Date.now());
    } catch {
      setError("Failed to run predictions.");
    } finally {
      setIsRunningPredictions(false);
    }
  };

if (loading) return <div className="text-center text-purple-300 mt-20">Loading...</div>;
 if (hackathonStatus === "not_found") {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#120024] via-[#1c003a] to-[#240050] flex items-center justify-center px-4">
      <div className="bg-[#1a002f] border border-pink-600 rounded-xl p-10 max-w-md text-center shadow-lg neon-border">
        <h2 className="text-3xl font-bold text-pink-400 mb-4">⚠️ No Active Hackathon</h2>
        <p className="text-gray-300 text-md mb-6">
          There are currently no hackathons live right now.
        </p>
        
      </div>
    </div>
  );
}

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#120024] via-[#1c003a] to-[#240050] text-white px-6 py-10 font-mono">
      <h2 className="text-4xl font-bold text-center text-purple-400 mb-8 neon-text">🚀 {hackathonTitle}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
        <div className="bg-gradient-to-br from-purple-800 to-indigo-900 p-6 rounded-xl shadow-lg text-center">
          <h4 className="text-xl font-bold mb-2 text-white">🏆 Prize Pool</h4>
          <p className="text-2xl text-emerald-400">{prizePool} ETH</p>
        </div>
        <div className="bg-gradient-to-br from-pink-700 to-purple-800 p-6 rounded-xl shadow-lg text-center">
          <h4 className="text-xl font-bold mb-2 text-white">👥 Participants</h4>
          <p className="text-2xl text-blue-300">{participants.length}</p>
        </div>
      </div>

      <div className="text-center mb-12">
        <button
          onClick={handleUploadModelPayment}
          disabled={isUploading}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg mr-4 shadow-xl transition"
        >
          {isUploading ? "Processing..." : "📤 Upload Model (1 ETH)"}
        </button>
        <button
          onClick={handleGetPredictions}
          disabled={isRunningPredictions}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xl transition"
        >
          {isRunningPredictions ? "🔄 Running..." : "📊 Get Predictions"}
        </button>
        {txError && <p className="text-red-400 mt-4">{txError}</p>}
      </div>

      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-purple-300 mb-6">📈 Submitted Models</h3>

        {models.length === 0 ? (
          <p className="text-gray-400 text-center">No models submitted yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map((model, index) => (
              <div key={index} className="bg-[#1e0033] border border-purple-700 p-5 rounded-xl shadow-md">
                <h4 className="text-xl font-bold text-purple-200">Uploader: {model.uploaded_by}</h4>
                <p className="text-gray-400 mt-1">📦 {model.model_file}</p>
                <p className="text-yellow-400 font-semibold mt-2">🏆 {model.reward_token} Tokens</p>

                {showPredictions && model.predictions && predictionStartTime && (
                  <div className="mt-4">
                    <h5 className="text-lg text-white font-semibold mb-2">🎯 Predictions</h5>
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
    </div>
  );
};

export default Home;
