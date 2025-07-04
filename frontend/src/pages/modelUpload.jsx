import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ModelUpload = () => {
  const [file, setFile] = useState(null);
  const access = localStorage.getItem("access");
  const navigate = useNavigate();
  const location = useLocation();

  console.log("🔍 Location state:", location.state);
  const hackathonId = location.state?.hackathonId;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    if (hackathonId === undefined || hackathonId === null) {
      alert("Missing hackathon ID.");
      return;
    }

    const formData = new FormData();
    formData.append("model", file); // backend expects this key
    formData.append("hackathon", hackathonId); // send hackathon ID

    try {
      console.log("Uploading with hackathonId:", hackathonId);
      const response = await fetch("http://localhost:8000/model/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          // DO NOT set Content-Type manually for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Upload success:", data);
      navigate("/home");
    } catch (error) {
      console.error("❌ Error during upload:", error);
      alert("Upload failed.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
      }}
    >
      <h2>Upload Your Strategy Model</h2>
      <input
        type="file"
        accept=".zip,.py"
        onChange={handleFileChange}
        style={{ width: "50%", padding: "8px", marginBottom: "10px" }}
      />
      <button
        style={{ width: "50%", padding: "8px", marginBottom: "10px" }}
        onClick={handleUpload}
      >
        Upload Model
      </button>
    </div>
  );
};

export default ModelUpload;
