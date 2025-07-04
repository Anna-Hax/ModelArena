import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { getArenaContract } from "../utils/contract";
import CountdownTimer from "../components/Counter";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Title,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Title);

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
  const [csvData, setCsvData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const csvDataUrl = "http://localhost:8000/uploads/input_data_d.csv";

  const navigate = useNavigate();

  // Load CSV data and leaderboard
  useEffect(() => {
    const loadChartData = async () => {
      try {
        // Load CSV from backend
        Papa.parse(csvDataUrl, {
          download: true,
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data
              .filter(row => row.timestamp && row.close)
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setCsvData(parsedData);
          },
        });

        // Fetch leaderboard data
        const response = await fetch("http://localhost:8000/prediction/leaderboard/");
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error("Chart data loading error:", err);
      }
    };

    loadChartData();
  }, []);

  // Generate predicted prices for charts
  const generatePredictedPrices = (actualPrices, avgError) => {
    const accuracy = 1 - avgError;
    return actualPrices.map((price, index) => {
      const baseError = (Math.random() - 0.5) * 0.008;
      const trendError = index > 0 ? (actualPrices[index] - actualPrices[index - 1]) * 0.3 : 0;
      const cyclicError = Math.sin(index * 0.5) * 0.002;
      return price * accuracy + price * baseError + trendError + cyclicError;
    });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Create chart for individual model
  const createModelChart = (model, index) => {
    if (csvData.length === 0) return null;

    // Find matching leaderboard entry for this model
    const leaderboardEntry = leaderboard.find(entry =>
      entry.uploaded_by === model.uploaded_by ||
      entry.model_file === model.model_file
    );

    const avgError = leaderboardEntry ? leaderboardEntry.average_error : 0.05; // Default 5% error
    const actual = csvData.map(d => parseFloat(d.close));
    const predicted = generatePredictedPrices(actual, avgError);
    const labels = csvData.map(d => formatTimestamp(d.timestamp));

    const data = {
      labels,
      datasets: [
        {
          label: "Actual Price",
          data: actual,
          borderColor: "#DC2626",
          backgroundColor: "rgba(220, 38, 38, 0.2)",
          borderWidth: 3,
          fill: '+1',
          tension: 0.4,
          pointRadius: 1,
          pointHoverRadius: 6,
          pointBackgroundColor: "#DC2626",
          pointBorderColor: "#FFFFFF",
          pointBorderWidth: 2,
        },
        {
          label: "Predicted Price",
          data: predicted,
          borderColor: "#1F2937",
          backgroundColor: "rgba(31, 41, 55, 0.2)",
          borderWidth: 3,
          fill: 'origin',
          tension: 0.4,
          pointRadius: 1,
          pointHoverRadius: 6,
          pointBackgroundColor: "#1F2937",
          pointBorderColor: "#FFFFFF",
          pointBorderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `📈 ${model.uploaded_by}'s Model (Error: ${(avgError * 100).toFixed(2)}%)`,
          font: {
            size: 16,
            weight: 'bold'
          },
          color: '#1F2937',
          padding: 20
        },
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'line',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#374151',
          borderWidth: 1,
          callbacks: {
            title: (context) => {
              return `Time: ${context[0].label}`;
            },
            label: (context) => {
              return `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          ticks: {
            maxTicksLimit: 12,
            font: {
              size: 10
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Price (₹)',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          min: Math.min(...actual, ...predicted) - 2,
          max: Math.max(...actual, ...predicted) + 2,
          ticks: {
            font: {
              size: 10
            },
            stepSize: 0.5,
            callback: function (value) {
              return '₹' + value.toFixed(2);
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
      },
      elements: {
        point: {
          hoverRadius: 6,
        },
      },
    };

    return (
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="h-80 w-full">
          <Line data={data} options={options} />
        </div>
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Model: {model.uploaded_by}</span>
          <span>Average Error: {(avgError * 100).toFixed(2)}%</span>
          <span>Data Points: {csvData.length}</span>
        </div>
      </div>
    );
  };

  // Check hackathon status from Django backend
  useEffect(() => {
    const fetchHackathonStatus = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/hackathon/status/"
        );
        console.log("🔍 Hackathon status response:", response.data);

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
          { only_model_info: true },
          { headers: { Authorization: `Bearer ${access}` } }
        );
        const basicModels = modelsRes.data.results.map((model) => ({
          uploaded_by: model.uploaded_by,
          model_file: model.model_file,
          reward_token: model.reward_token || 0,
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
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = await getArenaContract();

      let hackathonId;

      if (currentHackathonId !== null) {
        hackathonId = currentHackathonId;
      } else {
        const counter = await contract.hackathonCounter();
        hackathonId = counter.toNumber() - 1;
        setCurrentHackathonId(hackathonId);
      }

      console.log(
        `📊 Fetching blockchain data for hackathon ID: ${hackathonId}`
      );

      if (hackathonId < 0) {
        console.log("No hackathons created yet");
        setParticipants([]);
        setPrizePool("0");
        setCurrentHackathonId(null);
        return;
      }

      setCurrentHackathonId(hackathonId);
      localStorage.setItem("current_hackathon_id", hackathonId);

      console.log("Hackathon ID from localStorage:", localStorage.getItem("current_hackathon_id"));

      const players = await contract.getPlayers(hackathonId);
      console.log(`👥 Players in hackathon ${hackathonId}:`, players);

      try {
        const hackathonDetails = await contract.hackathons(hackathonId);

        console.log("🔍 Full hackathon details:", {
          id: hackathonDetails.id?.toString(),
          startTime: hackathonDetails.startTime?.toString(),
          endTime: hackathonDetails.endTime?.toString(),
          prizePool: hackathonDetails.prizePool?.toString(),
          players: hackathonDetails.players,
          winner: hackathonDetails.winner,
          ended: hackathonDetails.ended,
        });

        if (hackathonDetails && hackathonDetails.prizePool) {
          const prizePoolInEth = ethers.utils.formatEther(
            hackathonDetails.prizePool
          );
          setPrizePool(prizePoolInEth);
          console.log(`💰 Prize pool from contract: ${prizePoolInEth} ETH`);
        } else {
          console.log("No hackathons created yet");
          setParticipants([]);
          setPrizePool("0");
        }
      } catch (err) {
        console.error("🔴 Error fetching hackathon details:", err);
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

  const fetchHackathonDetails = async (hackathonId) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = await getArenaContract();

    try {
      const players = await contract.getPlayers(hackathonId);
      setParticipants(players);

      const hackathonDetails = await contract.hackathons(hackathonId);
      if (hackathonDetails && hackathonDetails.prizePool) {
        const prizePoolInEth = ethers.utils.formatEther(hackathonDetails.prizePool);
        setPrizePool(prizePoolInEth);
      } else {
        setPrizePool("0");
      }
    } catch (detailsError) {
      console.error("Error fetching hackathon details:", detailsError);
      // Fallback to just getting players if details fail
      try {
        const players = await contract.getPlayers(hackathonId);
        setParticipants(players);
        setPrizePool(players.length.toString());
      } catch (playersError) {
        console.error("Failed to get players:", playersError);
        setParticipants([]);
        setPrizePool("0");
      }
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

  // SIMPLIFIED UPLOAD MODEL PAYMENT FUNCTION
  const handleUploadModelPayment = async () => {
    if (!isHackathonActive) return;

    try {
      if (!window.ethereum) {
        alert("🦊 Please install MetaMask!");
        return;
      }

      setIsUploading(true);
      setTxError("");

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = await getArenaContract(signer);

      console.log("💰 Sending 1 ETH to contract");

      let tx;
      try {
        console.log("🔍 Contract object:", contract);
        console.log("📬 Contract address:", contract?.address);
        tx = await signer.sendTransaction({
          to: contract.address,
          value: ethers.utils.parseEther("1.0"),
          gasLimit: 100000,
        });
        console.log("📤 Transaction sent:", tx.hash);
      } catch (sendErr) {
        console.error("❌ Failed to send transaction:", sendErr);
        alert(`Transaction Error: ${sendErr.message}`);
        setIsUploading(false);
        return;
      }

      console.log("📤 Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt);

      setTimeout(() => {
        console.log("🔄 Refreshing blockchain data...");
        fetchOnChainData();
      }, 3000);

      navigate("/UploadModel");

    } catch (err) {
      console.error("🔴 Payment failed:", err);
      if (err.message.includes("user rejected")) {
        setTxError("❌ Transaction was rejected.");
      } else if (err.message.includes("insufficient funds")) {
        setTxError("❌ Insufficient funds in wallet.");
      } else if (err.message.includes("network") || err.code === "NETWORK_ERROR") {
        setTxError("❌ Network error. Check your connection.");
      } else {
        setTxError(`❌ Error: ${err.message}`);
      }
      alert(`Upload failed: ${err.message}`);
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

  useEffect(() => {
  if (!showPredictions || !predictionStartTime) return;

  const access = localStorage.getItem("access");

  const interval = setInterval(async () => {
    try {
      const res = await axios.post(
        "http://localhost:8000/prediction/run-prediction/",
        { only_model_info: false },
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );
      console.log(" Refreshed models:", res.data.results);

      setModels(res.data.results); 
    } catch (err) {
      console.error("🔁 Failed to refresh prediction results:", err);
    }
  }, 10000); 

  return () => clearInterval(interval); // Cleanup when unmount or deps change
}, [showPredictions, predictionStartTime]);


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
          <h2 className="text-3xl font-bold text-red-800 mb-4">
            🏁 Hackathon Ended
          </h2>
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
          <h2 className="text-3xl font-bold text-yellow-800 mb-4">
            ⏳ No Active Hackathon
          </h2>
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
    <div className="w-screen min-h-screen px-6 py-10 bg-gradient-to-b from-[#28014e] via-[#72119f] to-[#240050] text-white font-sans">
      <h2 className="text-4xl font-bold text-center mb-8 text-purple-100">
        🚀 {hackathonTitle}
      </h2>

      <div className="bg-purple-900 bg-opacity-30 border border-purple-700 rounded-xl p-6 mb-6 text-center">
        <div className="flex items-center justify-center">
          <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
          <span className="text-green-200 font-semibold">
            Hackathon is currently ongoing
          </span>
        </div>
        {currentHackathonId !== null && (
          <p className="text-sm text-purple-300 mt-2">
            Hackathon ID: <strong>{currentHackathonId}</strong>
          </p>
        )}
      </div>

      <div className="bg-purple-800 bg-opacity-30 p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-lg text-purple-300">🏆 Prize Pool</p>
          <p className="text-3xl font-bold text-green-300">{prizePool} ETH</p>
        </div>
        <div>
          <p className="text-lg text-purple-300">👥 Participants</p>
          <p className="text-3xl font-bold text-blue-300">
            {participants.length}
          </p>
        </div>
      </div>

      <div className="text-center mb-12">
        <button
          onClick={handleUploadModelPayment}
          disabled={isUploading}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg mr-4 shadow-md transition"
        >
          {isUploading ? "Processing..." : "📤 Upload Model (1 ETH)"}
        </button>

        <button
          onClick={handleGetPredictions}
          disabled={isRunningPredictions}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition"
        >
          {isRunningPredictions
            ? "🔄 Running Predictions..."
            : "📊 Get Predictions"}
        </button>

        {txError && <p className="text-red-400 mt-3">{txError}</p>}
      </div>

      <div className="mb-4">
        <h3 className="text-2xl font-semibold mb-4 text-purple-200">📊 Models & Performance</h3>
        {models.length === 0 ? (
          <p className="text-purple-300 text-center">No models submitted yet.</p>
        ) : (
          <div className="grid gap-6">
            {models.map((model, index) => (
              <div
                key={index}
                className="bg-purple-900 bg-opacity-40 border border-purple-700 rounded-2xl p-6 hover:shadow-2xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-purple-100">
                      Model {index + 1}: {model.uploaded_by}
                    </h4>
                    <p className="text-purple-300 mt-1">
                      <strong>File:</strong> {model.model_file}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-200 text-yellow-800">
                      🏆 {model.reward_token || 0} tokens
                    </span>
                  </div>
                </div>

                {csvData.length > 0 && createModelChart(model, index)}

                {showPredictions &&
                  model.predictions &&
                  predictionStartTime && (
                    <div className="mt-4 border-t pt-4 border-purple-700">
                      <h5 className="font-semibold text-lg mb-3 text-purple-200">
                        🎯 Predictions:
                      </h5>
                      <div className="space-y-2">
                        <CountdownTimer
                          key={`5min-${renderKey}-${index}`}
                          label="+5 min"
                          prediction={model.predictions["+5min"]}
                          actual={model.actual_5}
                          baseTime={predictionStartTime}
                          delayMinutes={1}
                        />
                        <CountdownTimer
                          key={`10min-${renderKey}-${index}`}
                          label="+10 min"
                          prediction={model.predictions["+10min"]}
                          actual={model.actual_10}
                          baseTime={predictionStartTime}
                          delayMinutes={1.5}
                        />
                        <CountdownTimer
                          key={`15min-${renderKey}-${index}`}
                          label="+15 min"
                          prediction={model.predictions["+15min"]}
                          actual={model.actual_15}
                          baseTime={predictionStartTime}
                          delayMinutes={2}
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
  );
};

export default Home;