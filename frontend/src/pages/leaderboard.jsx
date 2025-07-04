import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/prediction/leaderboard/`)
      .then((response) => {
        setData(response.data.leaderboard);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load leaderboard:", error);
        setLoading(false);
      });
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return "🏆";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return "🏅";
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-400/50";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-black shadow-lg shadow-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-400/50";
      default:
        return "bg-white/10 text-purple-100 hover:bg-white/20 border border-white/20";
    }
  };

  return (
    <div className="min-h-screen w-screen pt-32 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1e003e] via-[#2d005f] to-[#44007e] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-600/30 rounded-full border border-purple-400/50">
              <svg className="w-8 h-8 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-200 to-white bg-clip-text text-transparent">
              Model Leaderboard
            </h1>
          </div>
          <p className="text-purple-300 text-lg max-w-2xl mx-auto">
            Discover the top-performing models ranked by accuracy and performance metrics
          </p>
        </div>

        {/* Content */}
        <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3 text-purple-300">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-300 border-t-transparent"></div>
                <span className="text-lg">Loading leaderboard...</span>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <svg className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-purple-200 mb-2">No Results Yet</h3>
              <p className="text-purple-400 text-lg">
                Be the first to submit a model and claim the top spot!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-purple-300 text-sm uppercase tracking-wider">
                      <th className="text-left py-4 px-6">Rank</th>
                      <th className="text-left py-4 px-6">Model</th>
                      <th className="text-left py-4 px-6">Uploader</th>
                      <th className="text-left py-4 px-6">Avg Error</th>
                      <th className="text-left py-4 px-6">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((entry, idx) => (
                      <tr
                        key={idx}
                        className={`rounded-2xl transition-all duration-300 hover:scale-[1.02] transform ${getRankStyle(entry.rank)}`}
                      >
                        <td className="py-6 px-6 rounded-l-2xl">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getRankIcon(entry.rank)}</span>
                            <span className="text-2xl font-bold">#{entry.rank}</span>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="font-semibold text-lg truncate max-w-xs">
                            {entry.model_file}
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {entry.uploaded_by.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{entry.uploaded_by}</span>
                          </div>
                        </td>
                        <td className="py-6 px-6">
                          <div className="text-xl font-bold">
                            {entry.average_error.toFixed(3)}
                          </div>
                        </td>
                        <td className="py-6 px-6 rounded-r-2xl">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-black/20 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
                                style={{ width: `${Math.max(10, 100 - (entry.average_error * 100))}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {Math.max(10, 100 - (entry.average_error * 100)).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {data.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl p-6 transition-all duration-300 ${getRankStyle(entry.rank)}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getRankIcon(entry.rank)}</span>
                        <span className="text-2xl font-bold">#{entry.rank}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{entry.average_error.toFixed(3)}</div>
                        <div className="text-sm opacity-75">Avg Error</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm opacity-75 mb-1">Model</div>
                        <div className="font-semibold text-lg truncate">{entry.model_file}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm opacity-75 mb-1">Uploader</div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {entry.uploaded_by.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{entry.uploaded_by}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm opacity-75 mb-2">Performance</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
                              style={{ width: `${Math.max(10, 100 - (entry.average_error * 100))}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.max(10, 100 - (entry.average_error * 100)).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;