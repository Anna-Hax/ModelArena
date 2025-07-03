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
  const [currentHackathonId, setCurrentHackathonId] = useState(null);
  const [hackathonStatus, setHackathonStatus] = useState(null); // ongoing, ended, not_found
  const [isHackathonActive, setIsHackathonActive] = useState(false);

  const navigate = useNavigate();

  // Check hackathon status from Django backend
  useEffect(() => {
    const fetchHackathonStatus = async () => {
      try {
        const response = await axios.get("http://localhost:8000/hackathon/status/");
        console.log("🔍 Hackathon status response:", response.data);
        
        if (response.data.status === "ongoing") {
          setHackathonStatus("ongoing");
          setHackathonTitle(response.data.title);
          setIsHackathonActive(true);
          // Store the active hackathon ID from backend if available
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
        console.error("🔴 Failed to fetch hackathon status:", err);
        setError("Failed to fetch hackathon status.");
        setHackathonStatus("not_found");
        setIsHackathonActive(false);
      }
    };

    fetchHackathonStatus();
    // Check status every 30 seconds
    const interval = setInterval(fetchHackathonStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initial load - fetch model info only if hackathon is active
  useEffect(() => {
    if (!isHackathonActive) {
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        const access = localStorage.getItem("access");
        const modelsRes = await axios.post(
          "http://localhost:8000/prediction/run-prediction/",
          { only_model_info: true }, // Flag to only get model info
          { headers: { Authorization: `Bearer ${access}` } }
        );

        const basicModels = modelsRes.data.results.map(model => ({
          uploaded_by: model.uploaded_by,
          model_file: model.model_file,
          reward_token: model.reward_token || 0
        }));

        setModels(basicModels);
      } catch (err) {
        console.error("🔴 Initial data fetch failed:", err);
        setError("Failed to fetch model list.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [isHackathonActive]);

  // CORRECTED BLOCKCHAIN DATA FETCHING
  const fetchOnChainData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = await getArenaContract();
      
      let hackathonId;
      
      // Use hackathon ID from backend if available, otherwise use blockchain counter
      if (currentHackathonId !== null) {
        hackathonId = currentHackathonId;
      } else {
        const counter = await contract.hackathonCounter();
        hackathonId = counter.toNumber() - 1;
        // UPDATE STATE with the calculated hackathon ID
        setCurrentHackathonId(hackathonId);
      }

      console.log(`📊 Fetching blockchain data for hackathon ID: ${hackathonId}`);

      if (hackathonId < 0) {
        console.log("No hackathons created yet");
        setParticipants([]);
        setPrizePool("0");
        setCurrentHackathonId(null);
        return;
      }

      // Update state with correct hackathon ID
      setCurrentHackathonId(hackathonId);

      // Get participants for the current hackathon
      const players = await contract.getPlayers(hackathonId);
      console.log(`👥 Players in hackathon ${hackathonId}:`, players);

      // CORRECT WAY TO GET PRIZE POOL FROM YOUR CONTRACT
      try {
        // Your contract has hackathons mapping that returns the full struct
        const hackathonDetails = await contract.hackathons(hackathonId);
        
        console.log("🔍 Full hackathon details:", {
          id: hackathonDetails.id?.toString(),
          startTime: hackathonDetails.startTime?.toString(),
          endTime: hackathonDetails.endTime?.toString(),
          prizePool: hackathonDetails.prizePool?.toString(),
          players: hackathonDetails.players,
          winner: hackathonDetails.winner,
          ended: hackathonDetails.ended
        });

        if (hackathonDetails && hackathonDetails.prizePool) {
          const prizePoolInEth = ethers.utils.formatEther(hackathonDetails.prizePool);
          setPrizePool(prizePoolInEth);
          console.log(`💰 Prize pool from contract: ${prizePoolInEth} ETH`);
        } else {
          console.log("❌ No prize pool found in hackathon struct");
          setPrizePool("0");
        }

      } catch (err) {
        console.error("🔴 Error fetching hackathon details:", err);
        // Fallback to participant count * 1 ETH (minimum expected)
        const fallbackPrizePool = players.length;
        setPrizePool(fallbackPrizePool.toString());
        console.log(`💰 Fallback prize pool: ${fallbackPrizePool} ETH`);
      }

      setParticipants(players);
      
    } catch (err) {
      console.error("🔴 Blockchain fetch failed:", err);
      setError("Failed to fetch blockchain data.");
    }
  };

  // Blockchain data fetching - only if hackathon is active
  useEffect(() => {
    if (!isHackathonActive) {
      return;
    }

    fetchOnChainData();
    const interval = setInterval(fetchOnChainData, 15000);
    return () => clearInterval(interval);
  }, [isHackathonActive, currentHackathonId]);

  // SIMPLIFIED UPLOAD MODEL PAYMENT FUNCTION - SENDS ETH TO CONTRACT'S RECEIVE() FUNCTION
  const handleUploadModelPayment = async () => {
    if (!isHackathonActive) {
      return;
    }

    try {
      setIsUploading(true);
      setTxError("");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = await getArenaContract(signer);

      console.log("💰 Sending 1 ETH to contract - will trigger receive() function");
      
      // Send ETH directly to contract address
      // This will trigger the receive() function which you'll modify to update prize pool
      const tx = await signer.sendTransaction({
        to: contract.address,
        value: ethers.utils.parseEther("1.0"),
        gasLimit: 100000
      });

      console.log("📤 Transaction sent:", tx.hash);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt);
      
      // Refresh blockchain data to show updated prize pool
      setTimeout(() => {
        console.log("🔄 Refreshing blockchain data...");
        fetchOnChainData();
      }, 3000);
      
      navigate("/UploadModel");
      
    } catch (err) {
      console.error("🔴 Payment failed:", err);
      if (err.message.includes("user rejected")) {
        setTxError("Transaction was rejected by user.");
      } else if (err.message.includes("insufficient funds")) {
        setTxError("Insufficient funds to upload model.");
      } else {
        setTxError(`Failed to process payment: ${err.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Get Predictions - only if hackathon is active
  const handleGetPredictions = async () => {
    if (!isHackathonActive) {
      return;
    }

    setIsRunningPredictions(true);
    setError("");
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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>⏳ Loading hackathon data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg mb-4">❌ {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // No active hackathon state
  if (hackathonStatus === "ended") {
    return (
      <div className="home-container max-w-4xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-red-800 mb-4">🏁 Hackathon Ended</h2>
          <p className="text-xl text-red-700 mb-4">
            The hackathon "{hackathonTitle}" has ended.
          </p>
          <p className="text-gray-600">
            Please wait for the next hackathon to be announced.
          </p>
        </div>
      </div>
    );
  }

  if (hackathonStatus === "not_found" || !isHackathonActive) {
    return (
      <div className="home-container max-w-4xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-yellow-800 mb-4">⏳ No Active Hackathon</h2>
          <p className="text-xl text-yellow-700 mb-4">
            There is no active hackathon running at the moment.
          </p>
          <p className="text-gray-600">
            Please check back later or contact the organizers.
          </p>
        </div>
      </div>
    );
  }

  // Active hackathon state
  return (
    <div className="home-container max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">🚀 {hackathonTitle}</h2>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center">
          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-green-800 font-semibold">Hackathon is currently ongoing</span>
        </div>
        {currentHackathonId !== null && (
          <p className="text-sm text-gray-600 text-center mt-2">
            Hackathon ID: <strong>{currentHackathonId}</strong>
          </p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-lg">🏆 Prize Pool</p>
            <p className="text-2xl font-bold text-green-600">{prizePool} ETH</p>
          </div>
          <div>
            <p className="text-lg">👥 Participants</p>
            <p className="text-2xl font-bold text-blue-600">{participants.length}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 text-center">
        <button
          onClick={handleUploadModelPayment}
          disabled={isUploading}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg mr-4 transition-colors"
        >
          {isUploading ? "Processing..." : "📤 Upload Model (1 ETH)"}
        </button>
        
        <button
          onClick={handleGetPredictions}
          disabled={isRunningPredictions}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          {isRunningPredictions ? "🔄 Running Predictions..." : "📊 Get Predictions"}
        </button>
        
        {txError && <p className="text-red-600 mt-3">{txError}</p>}
      </div>

      <div className="mb-4">
        <h3 className="text-2xl font-semibold mb-4">📊 Models</h3>
        {models.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No models found for this hackathon.</p>
            <p className="text-sm mt-2">Be the first to upload a model!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {models.map((model, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">Uploader: {model.uploaded_by}</h4>
                    <p className="text-gray-600 mt-1"><strong>Model File:</strong> {model.model_file}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      🏆 {model.reward_token || 0} tokens
                    </span>
                  </div>
                </div>

                {/* Show predictions only after Get Predictions is clicked */}
                {showPredictions && model.predictions && predictionStartTime && (
                  <div className="mt-4 border-t pt-4">
                    <h5 className="font-semibold text-lg mb-3">🎯 Predictions:</h5>
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

      {/* Debug Info (you can remove this in production) */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
        <h4 className="font-semibold mb-2">Debug Info:</h4>
        <p>Current Hackathon ID: {currentHackathonId}</p>
        <p>Hackathon Status: {hackathonStatus}</p>
        <p>Is Active: {isHackathonActive.toString()}</p>
        <p>Prize Pool: {prizePool} ETH</p>
        <p>Participants: {participants.length}</p>
      </div>
    </div>
  )}
</div>

  );
};

export default Home;
