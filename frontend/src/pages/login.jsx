import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res1 = await axios.post("http://localhost:8000/auth/token/", form);
            const { access, refresh } = res1.data;
            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);
            navigate("/Home");
        } catch (error) {
            console.error("Error logging in user:", error);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[#1A0049] to-[#6E2B8E] flex flex-col items-center justify-center text-white px-4 py-12">
            {/* Branding - Made larger and more prominent */}
            <div className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-bold mb-2">
                    <span className="text-[#e0b3ff]">Model</span>
                    <span className="text-pink-400">Arena</span>
                </h1>
                <h2 className="text-3xl md:text-4xl font-semibold text-white/90">Enter the Arena</h2>
                <p className="text-purple-300 mt-3 text-lg">Welcome back, warrior</p>
            </div>

            {/* Login Form - Enhanced with better spacing and visual hierarchy */}
            <form
                onSubmit={handleSubmit}
                className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 md:p-10 flex flex-col gap-8 border border-purple-500/20"
            >
                {/* Email Field */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-purple-200">Email Address</label>
                    <div className="flex items-center bg-[#1f1f2e]/80 hover:bg-[#1f1f2e] rounded-xl px-4 py-3 transition-all duration-200 border border-purple-500/10">
                        <span className="mr-3 text-gray-400">📧</span>
                        <input
                            type="text"
                            name="username"
                            placeholder="Enter your email"
                            value={form.username}
                            onChange={handleChange}
                            className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-lg"
                            required
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-purple-200">Password</label>
                    <div className="flex items-center bg-[#1f1f2e]/80 hover:bg-[#1f1f2e] rounded-xl px-4 py-3 transition-all duration-200 border border-purple-500/10">
                        <span className="mr-3 text-gray-400">🔒</span>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-lg"
                            required
                        />
                    </div>
                </div>

                {/* Submit Button - More prominent with animation */}
                <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-purple-500/20 transform hover:scale-[1.02]"
                >
                    Enter Battle
                </button>

                {/* Footer Link - Better visibility */}
                <p className="text-center text-purple-300 mt-4">
                    New warrior?{" "}
                    <Link 
                        to="/register" 
                        className="underline hover:text-white font-medium transition-colors duration-200"
                    >
                        Join the Battle
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Login;