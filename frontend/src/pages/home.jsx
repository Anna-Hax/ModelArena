import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { getArenaContract } from "../utils/contract";
import CountdownTimer from "../components/Counter";
import { useNavigate, useLocation } from "react-router-dom";
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
  const [isJoining, setIsJoining] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [txError, setTxError] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const [predictionStartTime, setPredictionStartTime] = useState(null);
  const [renderKey, setRenderKey] = useState(Date.now());
  const [isRunningPredictions, setIsRunningPredictions] = useState(false);
  const [currentHackathonId, setCurrentHackathonId] = useState(null);
  const [hackathonStatus, setHackathonStatus] = useState(null);
  const [isHackathonActive, setIsHackathonActive] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const csvDataUrl = `${import.meta.env.VITE_API_BASE_URL}/uploads/input_data_d.csv`;

  const navigate = useNavigate();
  const location = useLocation();

  // Debug state changes
  useEffect(() => {
    console.log("🔍 State Debug:", {
      loading,
      hackathonStatus,
      isHackathonActive,
      currentHackathonId,
      error,
      modelsCount: models.length,
      participantsCount: participants.length
    });
  }, [loading, hackathonStatus, isHackathonActive, currentHackathonId, error, models.length, participants.length]);

  // Emergency loading timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Loading timeout - forcing loading to false");
        setLoading(false);
        setError("Loading timeout - please refresh the page");
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // 1. First useEffect - Handle hackathon status
  useEffect(() => {
    const fetchHackathonStatus = async () => {
      try {
        console.log("🔄 Fetching hackathon status...");
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/hackathon/status/`);
        
        console.log("✅ Hackathon status response:", response.data);
        
        if (response.data.status === "ongoing") {
          setHackathonStatus("ongoing");
          setHackathonTitle(response.data.title);
          setIsHackathonActive(true);
          
          if (response.data.hackathon_id) {
            setCurrentHackathonId(response.data.hackathon_id);
          }
          
          console.log("✅ Active hackathon found:", {
            title: response.data.title,
            hackathon_id: response.data.hackathon_id,
            django_id: response.data.django_id
          });
          
        } else if (response.data.status === "ended") {
          setHackathonStatus("ended");
          setHackathonTitle(response.data.title || "Hackathon");
          setIsHackathonActive(false);
          
        } else if (response.data.status === "upcoming") {
          setHackathonStatus("upcoming");
          setHackathonTitle(response.data.title || "Hackathon");
          setIsHackathonActive(false);
          
        } else {
          setHackathonStatus("not_found");
          setIsHackathonActive(false);
        }
        
        // IMPORTANT: Set loading to false after processing status
        setLoading(false);
        
      } catch (err) {
        console.error("🔴 Failed to fetch hackathon status:", err);
        setError("Failed to fetch hackathon status.");
        setHackathonStatus("not_found");
        setIsHackathonActive(false);
        setLoading(false); // Set loading to false even on error
      }
    };

    fetchHackathonStatus();
    const interval = setInterval(fetchHackathonStatus, 30000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array

  // 2. Second useEffect - Handle initial data fetching (only when hackathon is active)
  useEffect(() => {
    if (!isHackathonActive) {
      console.log("❌ No active hackathon, skipping model fetch");
      return;
    }

    const fetchInitialData = async () => {
      try {
        console.log("🔄 Fetching initial model data...");
        const access = localStorage.getItem("access");
        const modelsRes = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/prediction/run-prediction/`,
          { only_model_info: true },
          { headers: { Authorization: `Bearer ${access}` } }
        );

        const basicModels = modelsRes.data.results.map((model) => ({
          uploaded_by: model.uploaded_by,
          model_file: model.model_file,
          reward_token: model.reward_token || 0,
        }));

        setModels(basicModels);
        console.log("✅ Models loaded:", basicModels.length);
        
      } catch (err) {
        console.error("🔴 Initial data fetch failed:", err);
        setError("Failed to fetch model list.");
      }
    };

    fetchInitialData();
  }, [isHackathonActive]); // Only depend on isHackathonActive

  // 3. Third useEffect - Handle blockchain data (IMPROVED with shorter interval)
  useEffect(() => {
    if (!isHackathonActive || currentHackathonId === null) {
      console.log("❌ Skipping blockchain fetch - hackathon not active or no ID");
      return;
    }
    
    const fetchOnChainData = async () => {
      try {
        console.log("🔗 Fetching blockchain data for hackathon ID:", currentHackathonId);
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = await getArenaContract();
        
        const players = await contract.getPlayers(currentHackathonId);
        const hackathonDetails = await contract.hackathons(currentHackathonId);
        const prizePoolInEth = ethers.utils.formatEther(hackathonDetails.prizePool);

        setParticipants(players);
        setPrizePool(prizePoolInEth);
        
        console.log("✅ Blockchain data fetched successfully:", {
          participants: players.length,
          prizePool: prizePoolInEth
        });
        
      } catch (err) {
        console.error("🔴 Blockchain fetch failed:", err);
        setError("Failed to fetch blockchain data. Make sure the hackathon exists on the blockchain.");
      }
    };

    fetchOnChainData();
    
    // Use a shorter interval for more frequent updates
    const interval = setInterval(fetchOnChainData, 10000); // Check every 10 seconds instead of 15
    return () => clearInterval(interval);
  }, [isHackathonActive, currentHackathonId]); // Depend on both values

  // 4. Fourth useEffect - Load CSV data (independent of hackathon status)
  useEffect(() => {
    const loadChartData = async () => {
      try {
        console.log("🔄 Loading CSV data...");
        
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
            setRenderKey(Date.now());
            console.log("✅ CSV data loaded:", parsedData.length, "rows");
          },
          error: (error) => {
            console.error("🔴 CSV parsing error:", error);
          }
        });

        // Fetch leaderboard data
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/prediction/leaderboard/`);
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        console.log("✅ Leaderboard loaded:", data.leaderboard?.length || 0, "entries");
        
      } catch (err) {
        console.error("🔴 Chart data loading error:", err);
      }
    };

    loadChartData();
  }, []); // Load once on mount

  // 5. Fifth useEffect - Handle forced refresh from navigation (NEW)
  useEffect(() => {
    if (location.state?.forceRefresh && isHackathonActive && currentHackathonId !== null) {
      console.log("🔄 Force refresh triggered from navigation");
      
      // Clear the navigation state to prevent repeated refreshes
      navigate(location.pathname, { replace: true, state: {} });
      
      // Force refresh blockchain data after a short delay
      const forceRefreshBlockchain = async () => {
        try {
          console.log("🔄 Force refreshing blockchain data...");
          
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = await getArenaContract();
          
          const players = await contract.getPlayers(currentHackathonId);
          const hackathonDetails = await contract.hackathons(currentHackathonId);
          const prizePoolInEth = ethers.utils.formatEther(hackathonDetails.prizePool);

          setParticipants(players);
          setPrizePool(prizePoolInEth);
          
          console.log("✅ Forced blockchain refresh completed:", {
            participants: players.length,
            prizePool: prizePoolInEth
          });
          
        } catch (err) {
          console.error("🔴 Force refresh failed:", err);
        }
      };
      
      // Add a small delay to ensure blockchain state is fully updated
      setTimeout(forceRefreshBlockchain, 2000);
    }
  }, [location, isHackathonActive, currentHackathonId, navigate]);

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
            callback: function(value) {
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
          <Line key={`chart-${index}-${renderKey}`} data={data} options={options} />
        </div>
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Model: {model.uploaded_by}</span>
          <span>Average Error: {(avgError * 100).toFixed(2)}%</span>
          <span>Data Points: {csvData.length}</span>
        </div>
      </div>
    );
  };
  
  const navigateModelUpload = () => {
    if (!isHackathonActive) {
      alert("⛔ No active hackathon found. You cannot upload a model right now.");
      return;
    }
    navigate("/UploadModel");
  };

  const handleGetPredictions = async () => {
    if (!isHackathonActive) return;
    setIsRunningPredictions(true);
    setError("");
    try {
      const access = localStorage.getItem("access");
      const predRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/prediction/run-prediction/`,
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

  // Enhanced loading state with debug info
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#28014e] via-[#72119f] to-[#240050]">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-6"></div>
          <p className="text-xl mb-2">⏳ Loading hackathon data...</p>
          <p className="text-sm text-purple-200">
            Status: {hackathonStatus || 'Checking...'}
          </p>
          <p className="text-sm text-purple-200">
            Active: {isHackathonActive ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-purple-200">
            ID: {currentHackathonId || 'Not set'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8 bg-gradient-to-b from-[#28014e] via-[#72119f] to-[#240050] min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 text-lg mb-4">❌ {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Upcoming hackathon state
  if (hackathonStatus === "upcoming") {
    return (
      <div className="home-container max-w-4xl mx-auto p-6 text-center min-h-screen bg-gradient-to-b from-[#28014e] via-[#72119f] to-[#240050] flex items-center justify-center">
        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold text-blue-200 mb-4">
            ⏳ Hackathon Starting Soon
          </h2>
          <p className="text-xl text-blue-100 mb-4">
            The hackathon "{hackathonTitle}" will start soon.
          </p>
          <p className="text-blue-200">
            Please check back when the hackathon begins.
          </p>
        </div>
      </div>
    );
  }

  // Ended hackathon state
  if (hackathonStatus === "ended") {
    return (
      <div className="home-container max-w-4xl mx-auto p-6 text-center min-h-screen bg-gradient-to-b from-[#28014e] via-[#72119f] to-[#240050] flex items-center justify-center">
        <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold text-red-200 mb-4">
            🏁 Hackathon Ended
          </h2>
          <p className="text-xl text-red-100 mb-4">
            The hackathon "{hackathonTitle}" has ended.
          </p>
          <p className="text-red-200">
            Please wait for the next hackathon to be announced.
          </p>
        </div>
      </div>
    );
  }

  // No active hackathon state
  if (hackathonStatus === "not_found" || !isHackathonActive) {
    return (
      <div className="home-container max-w-4xl mx-auto p-6 text-center min-h-screen bg-gradient-to-b from-[#28014e] via-[#72119f] to-[#240050] flex items-center justify-center">
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold text-yellow-200 mb-4">
            ⏳ No Active Hackathon
          </h2>
          <p className="text-xl text-yellow-100 mb-4">
            There is no active hackathon running at the moment.
          </p>
          <p className="text-yellow-200">
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
          onClick={navigateModelUpload}
          disabled={isUploading}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg mr-4 shadow-md transition"
        >
          {isUploading ? "Processing..." : "📤 Upload Model (0.0001 ETH)"}
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
                key={`model-${index}-${renderKey}`}
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
  );
};

export default Home;