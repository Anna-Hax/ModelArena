import React, { useEffect, useState } from "react";
import { getArenaContract } from "../utils/contract";
import { useWallet } from "../contexts/wallet_context";
import * as ethers from "ethers";

const JoinHackathon = () => {
  const [hackathonId, setHackathonId] = useState(null);
  const [prizePool, setPrizePool] = useState(null);
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [error, setError] = useState("");
  const [txProcessing, setTxProcessing] = useState(false);

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
    <div className="max-w-xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-10">
      <h1 className="text-3xl font-bold mb-4 text-center">🏁 Join Hackathon</h1>

      {!isConnected ? (
        <div className="text-center">
          <button
            className="bg-blue-600 text-white px-5 py-3 rounded-lg"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : hackathonId !== null ? (
        <>
          <p className="text-lg mb-2">Hackathon ID: {hackathonId}</p>
          <p className="text-lg mb-2">Status: <strong>{status}</strong></p>
          <p className="text-lg mb-2">Prize Pool: {prizePool} ETH</p>
          <p className="text-lg mb-4">Participants: {players.length}</p>

          {status === "Ongoing" && (
            <div className="text-center">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                onClick={handleJoin}
                disabled={txProcessing}
              >
                {txProcessing ? "Joining..." : "Join for 1 ETH"}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center">🔄 Loading hackathon info...</p>
      )}
    </div>
  );
};

export default JoinHackathon;
