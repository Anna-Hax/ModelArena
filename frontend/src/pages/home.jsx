import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { getArenaContract } from "../utils/contract";
import CountdownTimer from "../components/Counter";

const Home = () => {
  const [models, setModels] = useState([]);
  const [hackathonTitle, setHackathonTitle] = useState("");
  const [participants, setParticipants] = useState([]);
  const [prizePool, setPrizePool] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const access = localStorage.getItem("access");

        const [predRes, titleRes] = await Promise.all([
          axios.post(
            "http://localhost:8000/prediction/run-prediction/",
            {},
            { headers: { Authorization: `Bearer ${access}` } }
          ),
          axios.get("http://localhost:8000/hackathon/status/")
        ]);

        setModels(predRes.data.results);
        setHackathonTitle(titleRes.data.title);
      } catch (err) {
        console.error("🔴 Django fetch failed:", err);
        setError("Failed to fetch predictions or title.");
      }
    };

    fetchBackendData();
  }, []);

  useEffect(() => {
    const fetchOnChainData = async () => {
      try {
        const contract = await getArenaContract();

        const counter = await contract.hackathonCounter();
        const currentHackathonId = counter.toNumber() - 1;

        if (currentHackathonId < 0) {
          console.warn("No hackathon created yet.");
          return;
        }

        const players = await contract.getPlayers(currentHackathonId);
        const hackathon = await contract.hackathons(currentHackathonId);

        setParticipants(players);
        setPrizePool(ethers.utils.formatEther(hackathon.prizePool));
      } catch (err) {
        console.error("🔴 Blockchain fetch failed:", err);
        setError("Failed to fetch blockchain data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOnChainData();

    // Optional: refetch every 15s for real-time updates
    const interval = setInterval(fetchOnChainData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>⏳ Loading predictions...</div>;
  if (error) return <div>❌ {error}</div>;

  return (
    <div className="home-container">
      <h2>🚀 {hackathonTitle || "Hackathon"}</h2>

      <div className="text-md text-gray-700 mb-4">
        <p>🏆 Prize Pool: <strong>{prizePool} ETH</strong></p>
        <p>👥 Participants: <strong>{participants.length}</strong></p>
      </div>

      <h3 className="text-xl font-semibold mt-4">📊 Model Predictions</h3>
      {models.length === 0 ? (
        <p>No models found.</p>
      ) : (
        <div className="model-grid">
          {models.map((model, index) => (
            <div key={index} className="model-card">
              <h3>Uploader: {model.uploaded_by}</h3>
              <p><strong>Model File:</strong> {model.model_file}</p>

              {model.predictions && model.timestamp ? (
                <div className="predictions">
                  <CountdownTimer
                    label="+5 min"
                    prediction={model.predictions["+5min"]}
                    actual={model.actual_5}
                    baseTime={model.timestamp}
                    delayMinutes={5}
                  />
                  <CountdownTimer
                    label="+10 min"
                    prediction={model.predictions["+10min"]}
                    actual={model.actual_10}
                    baseTime={model.timestamp}
                    delayMinutes={10}
                  />
                  <CountdownTimer
                    label="+15 min"
                    prediction={model.predictions["+15min"]}
                    actual={model.actual_15}
                    baseTime={model.timestamp}
                    delayMinutes={15}
                  />
                </div>
              ) : (
                <p className="error-text">❌ Missing predictions or timestamp.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
