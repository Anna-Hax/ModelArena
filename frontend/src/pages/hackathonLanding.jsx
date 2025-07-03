import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getArenaContract } from "../utils/contract";
import * as ethers from "ethers";
const HackathonLanding = () => {
  const [hackathon, setHackathon] = useState(null);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(null);
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [txError, setTxError] = useState("");
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "00:00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 🧠 Fetch status from backend every 15s
  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const res = await axios.get("http://localhost:8000/hackathon/status/");
        setHackathon(res.data);
        setStatus(res.data.status);

        if (res.data.status === "upcoming") {
          setTimer(Math.floor(res.data.time_to_start));
        } else if (res.data.status === "ongoing") {
          setTimer(Math.floor(res.data.time_remaining));
        } else {
          setTimer(0);
        }
      } catch (err) {
        setError("Failed to load hackathon details.");
        console.error(err);
      }
    };

    fetchHackathon();
    const interval = setInterval(fetchHackathon, 15000);
    return () => clearInterval(interval);
  }, []);

  // ⏱️ Countdown locally
  useEffect(() => {
    if (timer === null || timer <= 0 || !hackathon) return;

    const interval = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);

          if (status === "upcoming") {
            setStatus("ongoing");
            return hackathon.duration_minutes * 60;
          } else if (status === "ongoing") {
            setStatus("ended");
            return 0;
          }
        }

        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, status, hackathon]);

  const handleOpenModal = () => {
    setShowModal(true);
    setTxError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTxError("");
  };
const handleJoinAndEnter = async () => {
  try {
    setIsJoining(true);

    const provider = new ethers.providers.Web3Provider(window.ethereum); // ✅ v5 syntax
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    const contract = await getArenaContract(signer); // Pass signer to write

    // ✅ Get the latest hackathon ID
    const counter = await contract.hackathonCounter();
    if (counter.toNumber() === 0) {
      setTxError("❌ No active hackathon on blockchain.");
      return;
    }

    const hackathonId = counter.toNumber() - 1;

    // ✅ Check if user already joined
    const players = await contract.getPlayers(hackathonId);
    const alreadyJoined = players.some(
      (addr) => addr.toLowerCase() === userAddress.toLowerCase()
    );

    if (alreadyJoined) {
      console.log("✅ Already joined, skipping payment");
      setShowModal(false);
      navigate("/home");
      return;
    }

    // ❌ Not joined yet, proceed to pay & join
    const tx = await contract.joinHackathon(hackathonId, {
      value: ethers.utils.parseEther("1.0"),
    });
    await tx.wait();

    setShowModal(false);
    navigate("/home");
  } catch (err) {
    console.error("Join failed:", err);
    setTxError("❌ Join failed. " + (err?.message || ""));
  } finally {
    setIsJoining(false);
  }
};



  const isLastTen = timer !== null && timer <= 10 && status !== "ended";

  if (error) return <div className="text-red-600">{error}</div>;
  if (!hackathon) return <div>⏳ Loading hackathon info...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 rounded-xl shadow-lg bg-white">
      <h1 className="text-3xl font-bold text-center mb-4 animate-fadeIn">
        🚀 {hackathon.title}
      </h1>

      <div className="text-lg text-gray-700 mb-2">
        <strong>Status:</strong>{" "}
        {status === "ongoing"
          ? "🟢 Ongoing"
          : status === "upcoming"
          ? "⏳ Upcoming"
          : "✅ Ended"}
      </div>

      {status !== "ended" && (
        <div
          className={`text-2xl font-semibold mb-4 ${
            isLastTen ? "text-red-600 animate-pulse" : "text-blue-700"
          }`}
        >
          {status === "upcoming" ? "Starts in:" : "Time remaining:"}{" "}
          {formatTime(timer)}
        </div>
      )}

      {hackathon.hackathon_dataset_url && (
        <div className="text-md text-blue-600 mt-2">
          📂{" "}
          <a
            href={hackathon.hackathon_dataset_url}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Dataset
          </a>
        </div>
      )}

      {status === "ongoing" && (
        <div className="mt-6 text-center">
          <button
            onClick={handleOpenModal}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition duration-300"
          >
            Enter Hackathon
          </button>
        </div>
      )}

      {/* 🧾 Wallet payment modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Join Hackathon</h2>
            <p className="mb-4">You need to pay <strong>1 ETH</strong> as entry fee.</p>

            {txError && <p className="text-red-600">{txError}</p>}

            <div className="flex justify-center gap-4">
              <button
                onClick={handleJoinAndEnter}
                disabled={isJoining}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                {isJoining ? "Processing..." : "Pay & Enter"}
              </button>
              <button
                onClick={handleCloseModal}
                className="px-5 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonLanding;


