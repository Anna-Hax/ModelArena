import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ModelUpload = () => {
  const [file, setFile] = useState(null);
  const access = localStorage.getItem("access");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("model", file);

    try {
      const response = await fetch("http://localhost:8000/model/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("Upload success:", data);
      navigate("/home");
    } catch (error) {
      console.error("Error during upload:", error);
      alert("Upload failed.");
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#1e003e] via-[#2d005f] to-[#44007e] flex flex-col items-center justify-center text-white px-6">

      <h2 className="text-3xl font-bold text-purple-300 mb-2">
        🧠 Upload Your Battle-Ready Model
      </h2>
      <p className="text-gray-300 mb-6 text-center">
        Upload a <code>.zip</code> file containing <code>train.py</code>, <code>model.py</code>, and <code>requirements.txt</code>
      </p>

      {/* File Structure Preview */}
      <div className="bg-gradient-to-br from-purple-900 to-[#310041] border border-purple-500 rounded-xl px-6 py-4 mb-8 w-full max-w-xl font-mono text-green-300 text-sm shadow-md">
        <p className="mb-1">user_upload.zip</p>
        <p className="ml-4">├── <span className="text-white">train.py</span> <span className="text-gray-400"># Training logic</span></p>
        <p className="ml-4">├── <span className="text-white">model.py</span> <span className="text-gray-400"># Prediction class</span></p>
        <p className="ml-4">└── <span className="text-white">requirements.txt</span> <span className="text-gray-400"># Dependencies</span></p>
      </div>

      {/* File Input */}
      <input
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="bg-[#2d004b] text-white px-4 py-2 rounded-lg shadow-md mb-6 cursor-pointer w-full max-w-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700"
      />

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-300"
      >
        🚀 Upload Model File
      </button>
    </div>
  );
};

export default ModelUpload;
