import React, { useState } from "react";
import axios from "axios";

const CreateHackathon = () => {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const access = localStorage.getItem("access");

      const response = await axios.post(
        "http://localhost:8000/hackathon/create/",
        {
          title,
          start_time: startTime,
        },
        {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        setStatus("✅ Hackathon created successfully!");
        setTitle("");
        setStartTime("");
      } else {
        setStatus("❌ Failed to create hackathon.");
      }
    } catch (err) {
      console.error("Error creating hackathon:", err);
      setStatus("❌ Error while creating hackathon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-xl rounded-xl border border-gray-200">
      <h2 className="text-3xl font-bold text-center mb-6 text-[#071E3D]">
        🎯 Create New Hackathon
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Hackathon Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter hackathon title"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-[#278EA5] focus:border-[#278EA5]"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-[#278EA5] focus:border-[#278EA5]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1F4287] text-white py-2 rounded-lg hover:bg-[#278EA5] transition"
        >
          {loading ? "⏳ Creating..." : "🚀 Create Hackathon"}
        </button>
      </form>

      {status && (
        <p className="mt-4 text-center text-sm text-gray-700">{status}</p>
      )}
    </div>
  );
};

export default CreateHackathon;
