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
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
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

  // Mock data for demonstration
  useEffect(() => {
    const mockHackathon = {
      id: 1,
      title: "AI Stock Prediction Challenge 2025",
      status: "ongoing",
      time_remaining: 3661, // 1 hour 1 minute 1 second
      duration_minutes: 120,
      hackathon_dataset_url: "https://example.com/dataset.zip",
      prize_pool: "50 ETH",
      participants: 127,
      description: "Build the most accurate ML model to predict stock prices in real-time. Compete against the world's best data scientists!"
    };
    
    setHackathon(mockHackathon);
    setStatus("ongoing");
    setTimer(3661);
  }, []);

  // Fetch blockchain data
  const fetchOnChainData = async () => {
    try {
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

      if (hackathonId >= 0) {
        const players = await contract.getPlayers(hackathonId);
        setParticipants(players);

        try {
          const hackathonDetails = await contract.hackathons(hackathonId);
          if (hackathonDetails && hackathonDetails.prizePool) {
            const prizePoolInEth = ethers.utils.formatEther(hackathonDetails.prizePool);
            setPrizePool(prizePoolInEth);
          }
        } catch (err) {
          console.error("Error fetching hackathon details:", err);
        }
      }
    } catch (err) {
      console.error("Blockchain fetch failed:", err);
    }
  };

  // Fetch blockchain data on component mount
  useEffect(() => {
    fetchOnChainData();
    const interval = setInterval(fetchOnChainData, 15000);
    return () => clearInterval(interval);
  }, [currentHackathonId]);

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
        setPulseEffect(prev => !prev);
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

  // PAYMENT INTEGRATION - This is the key function
  const handleJoinAndEnter = async () => {
  try {
    setIsJoining(true);
    setTxError("");

    // Check if MetaMask is available
    if (!window.ethereum) {
      throw new Error("MetaMask is required to join the hackathon");
    }

    // Setup Web3 connection
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();

    // ✅ Sepolia network check and switch
    if (network.chainId !== 11155111) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }], // Hex for 11155111 (Sepolia)
        });
      } catch (switchError) {
        throw new Error("Please switch to the Sepolia testnet in MetaMask.");
      }
    }

    const signer = provider.getSigner();
    const contract = await getArenaContract(signer);

    console.log("💰 Sending 1 ETH to contract - will trigger receive() function");

    // Send 1 ETH payment to the contract
    const tx = await signer.sendTransaction({
      to: contract.address,
      value: ethers.utils.parseEther("0.0001"), // Exactly 1 ETH
      gasLimit: 100000,
    });

    console.log("📤 Transaction sent:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt);

    // Refresh blockchain data after payment
    setTimeout(() => {
      console.log("🔄 Refreshing blockchain data...");
      fetchOnChainData();
    }, 3000);

    // Close modal and navigate to main app
    setShowModal(false);
    console.log("✅ Successfully joined hackathon, navigating to home");
    navigate("/home");

  } catch (err) {
    console.error("Join failed:", err);

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


  const getStatusConfig = (status) => {
    switch (status) {
      case "ongoing":
        return {
          icon: <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>,
          text: "Live Competition",
          color: "text-green-400",
          bgColor: "from-green-500/20 to-emerald-500/20",
          borderColor: "border-green-500/30"
        };
      case "upcoming":
        return {
          icon: <Clock className="w-4 h-4 text-yellow-400" />,
          text: "Starting Soon",
          color: "text-yellow-400",
          bgColor: "from-yellow-500/20 to-orange-500/20",
          borderColor: "border-yellow-500/30"
        };
      case "ended":
        return {
          icon: <CheckCircle className="w-4 h-4 text-blue-400" />,
          text: "Competition Ended",
          color: "text-blue-400",
          bgColor: "from-blue-500/20 to-purple-500/20",
          borderColor: "border-blue-500/30"
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-gray-400" />,
          text: "Unknown Status",
          color: "text-gray-400",
          bgColor: "from-gray-500/20 to-gray-500/20",
          borderColor: "border-gray-500/30"
        };
    }
  };

  const isLastTen = timer !== null && timer <= 10 && status !== "ended";
  const statusConfig = getStatusConfig(status);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/20 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-lg font-semibold">{error}</div>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
          <div className="text-white text-lg font-semibold">Loading hackathon details...</div>
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
            <div className={`flex items-center space-x-3 bg-gradient-to-r ${statusConfig.bgColor} backdrop-blur-sm px-6 py-3 rounded-full border ${statusConfig.borderColor}`}>
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

          {/* Live Stats 
          <div className="flex justify-center space-x-8 mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-green-400">{prizePool} ETH</div>
                  <div className="text-sm text-gray-400">Prize Pool</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-blue-400">{participants.length}</div>
                  <div className="text-sm text-gray-400">Participants</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <div>
                  <div className={`text-2xl font-bold ${isLastTen ? 'text-red-400 animate-pulse' : 'text-purple-400'}`}>
                    {formatTime(timer)}
                  </div>
                  <div className="text-sm text-gray-400">Time Left</div>
                </div>
              </div>
            </div>
          </div>
        </div>
*/}
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Target,
              title: "Real-time Evaluation",
              description: "Your models are tested against live market data every 5 minutes",
              color: "from-blue-500 to-cyan-500"
            },
            {
              icon: Shield,
              title: "Secure & Fair",
              description: "Blockchain-based entry fees and transparent prize distribution",
              color: "from-green-500 to-emerald-500"
            },
            {
              icon: Zap,
              title: "Instant Feedback",
              description: "Get immediate accuracy scores and leaderboard updates",
              color: "from-purple-500 to-pink-500"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
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
            Join the participants and show your skills 
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
                Entry fee: <span className="font-bold text-green-400">0.0001 ETH</span>
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Your entry fee contributes to the prize pool and ensures fair competition. 
                Make sure you have MetaMask installed and connected.
              </p>

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
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
    </div>
  )};



export default FancyHackathonLanding;