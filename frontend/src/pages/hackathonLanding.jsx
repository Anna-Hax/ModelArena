import React, { useEffect, useState } from "react";
import {
  Clock,
  Trophy,
  Users,
  Download,
  Zap,
  Rocket,
  Target,
  Shield,
  Sparkles,
  ChevronRight,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as ethers from "ethers";
import ArenaABI from "../contracts/Arena.json"; // ✅ import ABI
import axios from "axios";

import { getArenaContract } from "../utils/contract";

const FancyHackathonLanding = () => {
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(null);
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [txError, setTxError] = useState("");
  const [hasFulfilled, setHasFulfilled] = useState(false);
  const [particles, setParticles] = useState([]);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [currentHackathonId, setCurrentHackathonId] = useState(null);
  const [prizePool, setPrizePool] = useState("0");
  const [participants, setParticipants] = useState([]);
  const [hackathonStatus, setHackathonStatus] = useState(null);
  const [isHackathonActive, setIsHackathonActive] = useState(false);

  // 1. First useEffect - Fetch hackathon status from Django backend (same as home page)
  useEffect(() => {
    const fetchHackathonStatus = async () => {
      try {
        console.log("🔄 Fetching hackathon status from Django...");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/hackathon/status/`
        );

        console.log("✅ Hackathon status response:", response.data);

        if (response.data.status === "ongoing") {
          setHackathonStatus("ongoing");
          setStatus("ongoing");
          setIsHackathonActive(true);

          // Set the hackathon data
          const mockHackathon = {
            id: response.data.hackathon_id || response.data.django_id,
            title: response.data.title || "AI Stock Prediction Challenge 2025",
            status: "ongoing",
            time_remaining: response.data.time_remaining || 3661,
            duration_minutes: response.data.duration_minutes || 120,
            hackathon_dataset_url:
              response.data.hackathon_dataset_url ||
              "https://example.com/dataset.zip",
            prize_pool: "50 ETH",
            participants: 127,
            description:
              response.data.description ||
              "Build the most accurate ML model to predict stock prices in real-time. Compete against the world's best data scientists!",
          };

          setHackathon(mockHackathon);
          setTimer(response.data.time_remaining || 3661);

          // Set the current hackathon ID from Django response
          if (response.data.hackathon_id) {
            setCurrentHackathonId(response.data.hackathon_id);
            console.log(
              "✅ Set hackathon ID from Django:",
              response.data.hackathon_id
            );
          }
        } else if (response.data.status === "ended") {
          setHackathonStatus("ended");
          setStatus("ended");
          setIsHackathonActive(false);

          const endedHackathon = {
            id: response.data.hackathon_id || response.data.django_id,
            title: response.data.title || "AI Stock Prediction Challenge 2025",
            status: "ended",
            time_remaining: 0,
            duration_minutes: response.data.duration_minutes || 120,
            hackathon_dataset_url: response.data.hackathon_dataset_url,
            prize_pool: "50 ETH",
            participants: 127,
            description:
              response.data.description ||
              "Build the most accurate ML model to predict stock prices in real-time. Compete against the world's best data scientists!",
          };

          setHackathon(endedHackathon);
          setTimer(0);
        } else if (response.data.status === "upcoming") {
          setHackathonStatus("upcoming");
          setStatus("upcoming");
          setIsHackathonActive(false);

          const upcomingHackathon = {
            id: response.data.hackathon_id || response.data.django_id,
            title: response.data.title || "AI Stock Prediction Challenge 2025",
            status: "upcoming",
            time_remaining: response.data.time_remaining || 3661,
            duration_minutes: response.data.duration_minutes || 120,
            hackathon_dataset_url: response.data.hackathon_dataset_url,
            prize_pool: "50 ETH",
            participants: 127,
            description:
              response.data.description ||
              "Build the most accurate ML model to predict stock prices in real-time. Compete against the world's best data scientists!",
          };

          setHackathon(upcomingHackathon);
          setTimer(response.data.time_remaining || 3661);
        } else {
          setHackathonStatus("not_found");
          setStatus("not_found");
          setIsHackathonActive(false);
          setError("No hackathon found");
        }
      } catch (err) {
        console.error("🔴 Failed to fetch hackathon status:", err);
        setError("Failed to fetch hackathon status.");
        setHackathonStatus("not_found");
        setIsHackathonActive(false);

        // Fallback to mock data if Django fails
        const mockHackathon = {
          id: 1,
          title: "AI Stock Prediction Challenge 2025",
          status: "ongoing",
          time_remaining: 3661,
          duration_minutes: 120,
          hackathon_dataset_url: "https://example.com/dataset.zip",
          prize_pool: "50 ETH",
          participants: 127,
          description:
            "Build the most accurate ML model to predict stock prices in real-time. Compete against the world's best data scientists!",
        };

        setHackathon(mockHackathon);
        setStatus("ongoing");
        setTimer(3661);
      }
    };

    fetchHackathonStatus();
    const interval = setInterval(fetchHackathonStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch blockchain data (only when hackathon is active and we have ID)
  const fetchOnChainData = async () => {
    if (!isHackathonActive) {
      console.log("❌ No active hackathon, skipping blockchain fetch");
      return;
    }

    try {
      console.log("🔗 Fetching blockchain data...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = await getArenaContract();

      let hackathonId;
      if (currentHackathonId !== null) {
        hackathonId = currentHackathonId;
        console.log("✅ Using Django hackathon ID:", hackathonId);
      } else {
        // Fallback to blockchain counter
        const counter = await contract.hackathonCounter();
        hackathonId = counter.toNumber() - 1;
        setCurrentHackathonId(hackathonId);
        console.log("✅ Using blockchain counter ID:", hackathonId);
      }

      if (hackathonId >= 0) {
        const players = await contract.getPlayers(hackathonId);
        setParticipants(players);
        console.log("✅ Found participants:", players.length);

        try {
          const hackathonDetails = await contract.hackathons(hackathonId);
          if (hackathonDetails && hackathonDetails.prizePool) {
            const prizePoolInEth = ethers.utils.formatEther(
              hackathonDetails.prizePool
            );
            setPrizePool(prizePoolInEth);
            console.log("✅ Prize pool:", prizePoolInEth);
          }
        } catch (err) {
          console.error("Error fetching hackathon details:", err);
        }
      }
    } catch (err) {
      console.error("🔴 Blockchain fetch failed:", err);
    }
  };

  // Fetch blockchain data on component mount and when hackathon becomes active
  useEffect(() => {
    if (isHackathonActive) {
      fetchOnChainData();
      const interval = setInterval(fetchOnChainData, 15000);
      return () => clearInterval(interval);
    }
  }, [isHackathonActive, currentHackathonId]);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 12,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "00:00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Countdown timer
  useEffect(() => {
    if (timer === null || timer <= 0 || !hackathon) return;

    const interval = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          if (status === "ongoing") {
            setStatus("ended");
            if (!hasFulfilled) {
              console.log("✅ Hackathon ended, triggering fulfill");
              setHasFulfilled(true);
            }
            return 0;
          }
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, status, hackathon, hasFulfilled]);

  // Pulse effect for last 10 seconds
  useEffect(() => {
    if (timer !== null && timer <= 10 && status !== "ended") {
      setPulseEffect(true);
      const pulseInterval = setInterval(() => {
        setPulseEffect((prev) => !prev);
      }, 500);
      return () => clearInterval(pulseInterval);
    } else {
      setPulseEffect(false);
    }
  }, [timer, status]);

  const handleOpenModal = () => {
    setShowModal(true);
    setTxError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTxError("");
  };

  // PAYMENT INTEGRATION - Fixed to use correct hackathon ID
  const handleJoinAndEnter = async () => {
    try {
      setIsJoining(true);
      setTxError("");

      // ✅ Check if MetaMask is installed
      if (!window.ethereum) {
        setTxError("❌ MetaMask is required to join the hackathon.");
        return;
      }

      // ✅ Connect to Ethereum
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();

      // ✅ Ensure Sepolia Testnet (chainId: 11155111)
      if (network.chainId !== 11155111) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          });
        } catch (switchError) {
          setTxError("❌ Please switch to Sepolia testnet in MetaMask.");
          return;
        }
      }

      const signer = provider.getSigner();
      const contract = await getArenaContract(signer);

      // ✅ Use the correct hackathon ID
      let hackathonId;
      if (currentHackathonId !== null) {
        hackathonId = currentHackathonId;
        console.log("✅ Using stored hackathon ID:", hackathonId);
      } else {
        // Fallback to blockchain counter
        const counter = await contract.hackathonCounter();
        hackathonId = counter.toNumber() - 1;
        console.log("✅ Using fallback hackathon ID:", hackathonId);
      }

      console.log("📦 Joining hackathon with ID:", hackathonId);

      // ✅ Send ETH to join hackathon
      // const tx = await contract.joinHackathon(hackathonId, {
      //   value: ethers.utils.parseEther("0.0001"), // ✅ Correct usage
      //   gasLimit: 150000,
      // });


      const tx = await signer.sendTransaction({
        to: contract.address,
        value: ethers.utils.parseEther("0.0001"), // ETH to stake
        gasLimit: 150000, // Optional
      });

      console.log("📤 Transaction sent:", tx.hash);

      // ✅ Wait for confirmation
      const receipt = await tx.wait();
      console.log("✅ Transaction confirmed:", receipt);

      // Optional: Refresh on-chain data
      setTimeout(() => {
        console.log("🔄 Refreshing blockchain data...");
        fetchOnChainData();
      }, 3000);

      // ✅ Navigate to dashboard
      setShowModal(false);
      navigate("/home");
    } catch (err) {
      console.error("❌ Join failed:", err);

      if (err.code === 4001 || err.message.includes("user rejected")) {
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

  const getStatusConfig = (status) => {
    switch (status) {
      case "ongoing":
        return {
          icon: (
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          ),
          text: "Live Competition",
          color: "text-green-400",
          bgColor: "from-green-500/20 to-emerald-500/20",
          borderColor: "border-green-500/30",
        };
      case "upcoming":
        return {
          icon: <Clock className="w-4 h-4 text-yellow-400" />,
          text: "Starting Soon",
          color: "text-yellow-400",
          bgColor: "from-yellow-500/20 to-orange-500/20",
          borderColor: "border-yellow-500/30",
        };
      case "ended":
        return {
          icon: <CheckCircle className="w-4 h-4 text-blue-400" />,
          text: "Competition Ended",
          color: "text-blue-400",
          bgColor: "from-blue-500/20 to-purple-500/20",
          borderColor: "border-blue-500/30",
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-gray-400" />,
          text: "Unknown Status",
          color: "text-gray-400",
          bgColor: "from-gray-500/20 to-gray-500/20",
          borderColor: "border-gray-500/30",
        };
    }
  };

  const isLastTen = timer !== null && timer <= 10 && status !== "ended";
  const statusConfig = getStatusConfig(status);

  if (error && !hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/20 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-lg font-semibold">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
          <div className="text-white text-lg font-semibold">
            Loading hackathon details...
          </div>
          <div className="text-purple-300 text-sm mt-2">
            Status: {hackathonStatus || "Checking..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-40"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animation: `float ${particle.duration}s ease-in-out infinite ${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 animate-pulse"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div
              className={`flex items-center space-x-3 bg-gradient-to-r ${statusConfig.bgColor} backdrop-blur-sm px-6 py-3 rounded-full border ${statusConfig.borderColor}`}
            >
              {statusConfig.icon}
              <span className={`text-sm font-bold ${statusConfig.color}`}>
                {statusConfig.text}
              </span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
          </div>

          <h1 className="text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
              {hackathon.title}
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {hackathon.description}
          </p>

          {/* Live Stats */}
          <div className="flex justify-center space-x-8 mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {prizePool} ETH
                  </div>
                  <div className="text-sm text-gray-400">Prize Pool</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {participants.length}
                  </div>
                  <div className="text-sm text-gray-400">Participants</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <div>
                  <div
                    className={`text-2xl font-bold ${
                      isLastTen
                        ? "text-red-400 animate-pulse"
                        : "text-purple-400"
                    }`}
                  >
                    {formatTime(timer)}
                  </div>
                  <div className="text-sm text-gray-400">Time Left</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Target,
              title: "Real-time Evaluation",
              description:
                "Your models are tested against live market data every 5 minutes",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: Shield,
              title: "Secure & Fair",
              description:
                "Blockchain-based entry fees and transparent prize distribution",
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: Zap,
              title: "Instant Feedback",
              description:
                "Get immediate accuracy scores and leaderboard updates",
              color: "from-purple-500 to-pink-500",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
            >
              <div
                className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Action Section */}
        <div className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-blue-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Compete?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the {participants.length} participants and show your skills
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {hackathon.hackathon_dataset_url && (
              <a
                href={hackathon.hackathon_dataset_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50"
              >
                <Download className="w-5 h-5" />
                <span>Download Dataset</span>
              </a>
            )}

            {status === "ongoing" && (
              <button
                onClick={handleOpenModal}
                className="group flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50"
              >
                <Rocket className="w-5 h-5" />
                <span>Enter Competition</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Modal with Payment Integration */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl max-w-md w-full shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content */}
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl font-bold mb-4">Join Competition</h2>
              <p className="text-lg text-gray-300 mb-6">
                Entry fee:{" "}
                <span className="font-bold text-green-400">0.0001 ETH</span>
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Your entry fee contributes to the prize pool and ensures fair
                competition. Make sure you have MetaMask installed and
                connected.
              </p>

              {/* Show current hackathon ID */}
              <div className="text-sm text-purple-300 mb-4">
                Hackathon ID: <strong>{currentHackathonId}</strong>
              </div>

              {txError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{txError}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleJoinAndEnter}
                  disabled={isJoining}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isJoining ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Pay & Enter</span>
                    </div>
                  )}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-white/10 hover:bg-white/20 px-6 py-4 rounded-full font-bold text-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
};

export default FancyHackathonLanding;
