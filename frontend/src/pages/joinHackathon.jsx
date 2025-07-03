import React, { useEffect, useState } from "react";
import { getArenaContract } from "../utils/contract";
import { useWallet } from "../context/WalletContext";
import * as ethers from "ethers";

const JoinHackathon = () => {
  const [hackathonId, setHackathonId] = useState(null);
  const [prizePool, setPrizePool] = useState(null);
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [error, setError] = useState("");
  const [txProcessing, setTxProcessing] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const { address, isConnected, connectWallet } = useWallet();

  const fetchLatestHackathonInfo = async () => {
    try {
      const contract = await getArenaContract();
      const counter = await contract.hackathonCounter();
      const id = counter.toNumber() - 1;

      const hackathon = await contract.hackathons(id);
      const currentTime = Math.floor(Date.now() / 1000);

      if (hackathon.ended) {
        setStatus("Ended");
      } else if (currentTime < hackathon.startTime) {
        setStatus("Upcoming");
      } else if (currentTime >= hackathon.startTime && currentTime < hackathon.endTime) {
        setStatus("Ongoing");
      } else {
        setStatus("Expired (not finalized)");
      }

      const players = await contract.getPlayers(id);

      setHackathonId(id);
      setPrizePool(ethers.utils.formatEther(hackathon.prizePool));
      setPlayers(players);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch hackathon info");
    }
  };

  const handleJoin = async () => {
    try {
      setTxProcessing(true);
      const contract = await getArenaContract();

      const tx = await contract.joinHackathon(hackathonId, {
        value: ethers.utils.parseEther("1.0"),
      });

      await tx.wait();
      await fetchLatestHackathonInfo();
      alert("✅ Successfully joined hackathon!");
    } catch (err) {
      console.error("Join error:", err);
      alert("❌ Failed to join hackathon.");
    } finally {
      setTxProcessing(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchLatestHackathonInfo();
    }
  }, [isConnected]);

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-[#1F0B44] to-[#100624] rounded-2xl shadow-[0_0_30px_rgba(128,0,255,0.25)] text-white">
      <h1 className="text-3xl font-bold text-center text-purple-300 mb-6">🏁 Join Hackathon</h1>

      {!isConnected ? (
        <div className="text-center">
          <button
            className="bg-gradient-to-r from-[#21E6C1] to-[#278EA5] text-black font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
            onClick={connectWallet}
          >
            🔗 Connect Wallet
          </button>
        </div>
      ) : error ? (
        <p className="text-red-400 text-center">{error}</p>
      ) : hackathonId !== null ? (
        <div className="space-y-4 text-lg">
          <p>
            <span className="text-purple-400">Hackathon ID:</span> #{hackathonId}
          </p>
          <p>
            <span className="text-purple-400">Status:</span>{" "}
            <span
              className={`font-semibold ${
                status === "Ongoing"
                  ? "text-green-400"
                  : status === "Upcoming"
                  ? "text-yellow-300"
                  : "text-gray-400"
              }`}
            >
              {status}
            </span>
          </p>
          <p>
            <span className="text-purple-400">Prize Pool:</span>{" "}
            <span className="text-emerald-300">{prizePool} ETH</span>
          </p>
          <p>
            <span className="text-purple-400">Participants:</span>{" "}
            <span className="text-pink-300">{players.length}</span>
          </p>

          {status === "Ongoing" && (
            <div className="text-center mt-6">
              <button
                className={`bg-gradient-to-r from-green-400 to-emerald-500 text-black font-bold px-6 py-3 rounded-xl transition-all ${
                  txProcessing ? "opacity-60 cursor-not-allowed" : "hover:scale-105"
                }`}
                onClick={handleJoin}
                disabled={txProcessing}
              >
                {txProcessing ? "Joining..." : "Join for 1 ETH 🚀"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-purple-300 animate-pulse">🔄 Loading hackathon info...</p>
      )}
    </div>
  );
};

export default JoinHackathon;
