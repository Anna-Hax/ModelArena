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
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">📊 Model Leaderboard</h1>

      {loading ? (
        <p className="leaderboard-status">Loading...</p>
      ) : data.length === 0 ? (
        <p className="leaderboard-status">No results available yet.</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>🏅 Rank</th>
              <th>Model</th>
              <th>Uploader</th>
              <th>Avg Error</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, idx) => (
              <tr key={idx}>
                <td>{entry.rank}</td>
                <td>{entry.model_file}</td>
                <td>{entry.uploaded_by}</td>
                <td>{entry.average_error.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
