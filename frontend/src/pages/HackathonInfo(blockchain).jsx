import React, { useEffect, useState } from "react";
import { getArenaContract } from "../utils/contract";
//import { ethers } from "ethers";
//
//const HackathonInfo = () => {
//  const [hackathon, setHackathon] = useState(null);
//  const [loading, setLoading] = useState(true);
//
//  useEffect(() => {
//    const fetchHackathon = async () => {
//      try {
//        const contract = await getArenaContract();
//        const data = await contract.hackathons(0);
//        setHackathon(data);
//      } catch (error) {
//        console.error("Error fetching hackathon:", error);
//      } finally {
//        setLoading(false);
//      }
//    };
//    fetchHackathon();
//  }, []);
//
//  return (
//    <div className="w-screen min-h-screen px-6 py-10 bg-gradient-to-b from-[#28014e] via-[#72119f] to-[#240050] text-white font-sans">
//      <div className="max-w-3xl mx-auto p-8 rounded-2xl shadow-xl backdrop-blur-md bg-white/5 border border-white/10">
//        <h1 className="text-3xl font-bold text-purple-100 mb-6 text-center flex items-center justify-center gap-2">
//          🚀 Hackathon Overview
//        </h1>
//
//        {loading ? (
//          <p className="text-center text-purple-300 animate-pulse">Fetching hackathon data...</p>
//        ) : !hackathon ? (
//          <p className="text-center text-red-400">Failed to load hackathon info.</p>
//        ) : (
//          <div className="space-y-4 text-lg text-purple-200">
//            <div className="flex justify-between items-center">
//              <span className="font-medium">📅 Start Time:</span>
//              <span className="text-right">
//                {new Date(Number(hackathon.startTime) * 1000).toLocaleString()}
//              </span>
//            </div>
//            <div className="flex justify-between items-center">
//              <span className="font-medium">⏰ End Time:</span>
//              <span className="text-right">
//                {new Date(Number(hackathon.endTime) * 1000).toLocaleString()}
//              </span>
//            </div>
//            <div className="flex justify-between items-center">
//              <span className="font-medium">🎁 Prize Pool:</span>
//              <span className="text-right text-emerald-300 font-semibold">
//                {ethers.utils.formatEther(hackathon.prizePool.toString())} ETH
//              </span>
//            </div>
//          </div>
//        )}
//      </div>
//    </div>
//  );
//};
//
//export default HackathonInfo;
//
//
//import React, { useEffect, useState } from "react";

const HackathonInfo = () => {
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        // Replace this with your actual contract call:
        const contract = await getArenaContract();
        const data = await contract.hackathons(0);
        setHackathon(data);
        
        // Mock data for demonstration
        const mockHackathon = {
          startTime: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
          endTime: Math.floor(Date.now() / 1000) + 604800, // 1 week from now
          prizePool: "5000000000000000000" // 5 ETH in wei
        };
        
        setTimeout(() => {
          setHackathon(mockHackathon);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching hackathon:", error);
        setLoading(false);
      }
    };
    fetchHackathon();
  }, []);

  const formatEther = (weiValue) => {
    // Simple ETH conversion (replace with ethers.utils.formatEther in your actual code)
    return (parseInt(weiValue) / 1e18).toFixed(4);
  };

  return (
    <div className="w-screen min-h-screen pt-32 pb-8 px-6 bg-gradient-to-b from-[#28014e] via-[#72119f] to-[#240050] text-white font-sans">
      <div className="max-w-3xl mx-auto p-8 rounded-2xl shadow-xl backdrop-blur-md bg-white/5 border border-white/10">
        <h1 className="text-3xl font-bold text-purple-100 mb-6 text-center flex items-center justify-center gap-2">
          🚀 Hackathon Overview
        </h1>

        {loading ? (
          <div className="text-center text-purple-300">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-300 border-t-transparent"></div>
              <span className="animate-pulse">Fetching hackathon data...</span>
            </div>
          </div>
        ) : !hackathon ? (
          <div className="text-center text-red-400 p-8">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg">Failed to load hackathon info.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-200 flex items-center gap-2">
                    📅 Start Time:
                  </span>
                  <span className="text-right text-white font-semibold">
                    {new Date(Number(hackathon.startTime) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-200 flex items-center gap-2">
                    ⏰ End Time:
                  </span>
                  <span className="text-right text-white font-semibold">
                    {new Date(Number(hackathon.endTime) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl p-6 border border-emerald-400/30 hover:from-emerald-500/30 hover:to-green-500/30 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-200 flex items-center gap-2">
                    🎁 Prize Pool:
                  </span>
                  <span className="text-right text-emerald-300 font-bold text-xl">
                    {formatEther(hackathon.prizePool.toString())} ETH
                  </span>
                </div>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Hackathon Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HackathonInfo;