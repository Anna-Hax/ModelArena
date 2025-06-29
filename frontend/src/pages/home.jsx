import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await axios.post(
          "http://localhost:8000/prediction/run-prediction", // Your API endpoint
          {},
          {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          }
        );
        setModels(response.data.results);
      } catch (err) {
        setError("Failed to fetch predictions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) return <div>⏳ Loading predictions...</div>;
  if (error) return <div>❌ {error}</div>;

  return (
    <div className="home-container">
      <h2>📊 Model Predictions</h2>
      {models.length === 0 ? (
        <p>No models found.</p>
      ) : (
        <div className="model-grid">
          {models.map((model, index) => (
            <div key={index} className="model-card">
              <h3>Uploader: {model.uploaded_by}</h3>
              <p><strong>Model File:</strong> {model.model_file}</p>
              {model.predictions ? (
                <div className="predictions">
                  <p><strong>+5 min:</strong> {model.predictions["+5min"]}</p>
                  <p><strong>+10 min:</strong> {model.predictions["+10min"]}</p>
                  <p><strong>+15 min:</strong> {model.predictions["+15min"]}</p>
                </div>
              ) : (
                <p className="error-text">❌ Error: {model.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
