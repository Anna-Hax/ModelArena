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
  // eslint-disable-next-line no-unused-vars
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
        setError("Failed to fetch hackathon status.", err);
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
      const counter = await contract.hackathonCounter();
      const hackathonId = counter.toNumber()-1;

      const players = await contract.getPlayers(hackathonId);
      const userAddress = await signer.getAddress();
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
      console.log("Navigating with hackathonId:", hackathonId);
      navigate("/UploadModel", {state:{hackathonId}});
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

  if (loading) {
    return (
      <div className="h-screen w-screen pt-20 bg-gradient-to-br from-[#28014e] via-[#72119f] to-[#240050] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-300 border-t-transparent mx-auto mb-4"></div>
          <p className="text-purple-300 text-lg">Loading hackathon...</p>
        </div>
      </div>
    );
  }

  if (hackathonStatus === "not_found") {
    return (
      <div className="h-screen w-screen pt-20 bg-gradient-to-br from-[#28014e] via-[#72119f] to-[#240050] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-8 text-center shadow-2xl">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">No Active Hackathon</h2>
              <p className="text-purple-300 text-lg">
                There are currently no hackathons running. Check back later for exciting competitions!
              </p>
            </div>
            <div className="pt-4 border-t border-purple-500/20">
              <p className="text-purple-400 text-sm">
                Want to be notified when new hackathons start? Join our community!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-max w-screen pt-20 bg-gradient-to-br from-[#1e003e] via-[#2d005f] to-[#44007e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              {hackathonTitle}
            </h1>
          </div>
          <p className="text-purple-300 text-lg max-w-2xl mx-auto">
            Compete with ML models and win ETH rewards in this live hackathon
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-6 text-center shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-purple-200">Prize Pool</h3>
            <p className="text-3xl font-bold text-yellow-400">{prizePool} ETH</p>
            <p className="text-purple-400 text-sm mt-2">Total rewards available</p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 backdrop-blur-xl border border-pink-400/20 rounded-2xl p-6 text-center shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-pink-200">Participants</h3>
            <p className="text-3xl font-bold text-blue-400">{participants.length}</p>
            <p className="text-pink-400 text-sm mt-2">Active competitors</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleUploadModelPayment}
            disabled={isUploading}
            className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center gap-2">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload Model</span>
                  <span className="text-yellow-300 font-bold">(1 ETH)</span>
                </>
              )}
            </div>
          </button>
          
          <button
            onClick={handleGetPredictions}
            disabled={isRunningPredictions}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center justify-center gap-2">
              {isRunningPredictions ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Get Predictions</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Error Display */}
        {txError && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-300">{txError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Models Section */}
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-purple-200 mb-8 text-center">Submitted Models</h2>

          {models.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-purple-300 mb-2">No Models Yet</h3>
              <p className="text-purple-400">Be the first to upload a model and compete!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {models.map((model, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-800/20 to-pink-800/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6 hover:border-purple-400/50 transition-all duration-300 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {model.uploaded_by.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-purple-200">{model.uploaded_by}</h3>
                        <p className="text-purple-400 text-sm truncate max-w-xs">{model.model_file}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-yellow-400 font-bold">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                        </svg>
                        <span>{model.reward_token}</span>
                      </div>
                      <p className="text-purple-400 text-xs">Tokens</p>
                    </div>
                  </div>

                  {showPredictions && model.predictions && predictionStartTime && (
                    <div className="mt-6 pt-4 border-t border-purple-400/20">
                      <h4 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Live Predictions
                      </h4>
                      <div className="space-y-3">
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
      </div>
    </div>
  );
};

export default Home;