import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/auth/token/", form);
      const { access, refresh } = res.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem('wallet connect', false)
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#1e003e] via-[#2d005f] to-[#44007e] text-white flex items-center justify-center">
      <div className="w-full max-w-lg bg-[#1a1a2e] bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-10 px-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">
            <span className="text-purple-300">🧠 Model</span>
            <span className="text-pink-400">Arena</span>
          </h1>
          <h2 className="text-xl mt-2 font-semibold">Enter the Arena</h2>
          <p className="text-sm text-gray-400">Welcome back, warrior</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block mb-1 text-sm text-gray-300">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-lg bg-[#292943] text-white placeholder-gray-400 border border-[#444] focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-sm text-gray-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-lg bg-[#292943] text-white placeholder-gray-400 border border-[#444] focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transition duration-300"
          >
            Enter Battle
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          New warrior?{" "}
          <Link to="/register" className="text-pink-400 hover:underline">
            Join the Battle
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
