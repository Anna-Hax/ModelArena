import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8000/prediction/leaderboard/")
      .then((response) => {
        setData(response.data.leaderboard);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load leaderboard:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-screen h-screen px-6 py-10 bg-gradient-to-b from-[#28014e] via-[#72119f] to-[#240050] text-white font-sans">
      <div className="max-w-5xl mx-auto bg-gradient-to-rfrom-[#28014e] via-[#72119f] to-[#240050] p-8 rounded-2xl shadow-xl border border-purple-800">
        <h1 className="text-3xl font-bold text-purple-300 mb-6 text-center tracking-wide">
          📊 Model Leaderboard
        </h1>

        {loading ? (
          <p className="text-center text-purple-400 animate-pulse">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-purple-400">No results available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-900 bg-opacity-30 text-purple-200 uppercase text-sm">
                  <th className="py-3 px-4">🏅 Rank</th>
                  <th className="py-3 px-4">Model</th>
                  <th className="py-3 px-4">Uploader</th>
                  <th className="py-3 px-4">Avg Error</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, idx) => (
                  <tr
                    key={idx}
                    className={`transition-all duration-200 hover:bg-purple-700 hover:bg-opacity-20 ${
                      entry.rank === 1
                        ? "bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black font-semibold"
                        : entry.rank === 2
                        ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
                        : entry.rank === 3
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                        : "text-purple-100"
                    }`}
                  >
                    <td className="py-3 px-4">{entry.rank}</td>
                    <td className="py-3 px-4">{entry.model_file}</td>
                    <td className="py-3 px-4">{entry.uploaded_by}</td>
                    <td className="py-3 px-4">{entry.average_error.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
