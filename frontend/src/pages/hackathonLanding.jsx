import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HackathonLanding = () => {
  const [hackathon, setHackathon] = useState(null);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(null);
  const [status, setStatus] = useState(""); // "upcoming", "ongoing", "ended"
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

  // Fetch hackathon details
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
        }
      } catch (err) {
        setError("Failed to load hackathon details.");
        console.error(err);
      }
    };

    fetchHackathon();
  }, []);

  // ⏱️ Countdown
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

  const handleEnter = () => navigate("/home");

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
            onClick={handleEnter}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition duration-300"
          >
            Enter Hackathon
          </button>
        </div>
      )}
    </div>
  );
};

export default HackathonLanding;
