import React from 'react';
import { Clock, Users, Trophy, Star, Upload, Zap, Shield, Award } from 'lucide-react';

export default function MLModelsBattle() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-1000 via-purple-600 to-purple-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-purple-700/30">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <span className="text-xl font-bold">ModelArena</span>
          </div>
          <nav className="flex space-x-6 text-gray-300">
            <a href="#" className="text-gray-300 hover:text-white">Features</a>
            <a href="#" className="text-gray-300 hover:text-white">How It Works</a>
            <a href="#" className="text-gray-300 hover:text-white">Leaderboard</a>
          </nav>
        </div>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full font-semibold">
          Enter Arena
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 bg-purple-700/30 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">Live Tournament in Progress</span>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">ML Models</span>
            <br />
            <span className="text-white">Battle for Glory</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Upload your ML models to predict stock prices in real-time competitions.
            <br />
            Battle every 5 minutes, earn reward points, and win from blockchain-secured
            <br />
            prize pools.
          </p>
          
          <div className="flex justify-center space-x-4">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 rounded-full font-semibold">
              Join Battle
            </button>
            <button className="border border-purple-400 px-8 py-3 rounded-full font-semibold hover:bg-purple-700/30">
              Watch Live Arena
            </button>
          </div>
        </div>

        {/* Live Arena Stats */}
        <div className="flex justify-center mb-16">
          <div className="bg-purple-800/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm font-semibold">LIVE ARENA</span>
            </div>
            <div className="grid grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">₹2,847.50</div>
                <div className="text-sm text-gray-400">Current Pool</div>
              </div>
              <div>
                <div className="text-2xl font-bold">127</div>
                <div className="text-sm text-gray-400">Models Competing</div>
              </div>
              <div>
                <div className="text-2xl font-bold">2:34</div>
                <div className="text-sm text-gray-400">Next Round</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">₹9,450</div>
                <div className="text-sm text-gray-400">Prize Pool</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-8 mb-16 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">2,847</div>
            <div className="text-gray-400">Active Models</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">50K+</div>
            <div className="text-gray-400">Live Predictions/Day</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">$12.5K</div>
            <div className="text-gray-400">Prize Pool Today</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">87.3%</div>
            <div className="text-gray-400">Avg Accuracy</div>
          </div>
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Battle-Tested <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Experience the most advanced ML model competition platform with
            <br />
            real-time evaluation and blockchain rewards
          </p>
          
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-700/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Prediction Battles</h3>
              <p className="text-gray-400">
                Submit your models and compete in real-time
                5-minute prediction battles against the
                world's accuracy
                legends
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-700/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Competitive Arena System</h3>
              <p className="text-gray-400">
                Climb the leaderboard, earn
                tournament pay-outs,
                rank, and play from
                shared prize pools
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-700/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload & Train Models</h3>
              <p className="text-gray-400">
                Easily upload your models
                to secure containers
                with normalized training
                on historical data
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-700/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Blockchain Rewards</h3>
              <p className="text-gray-400">
                Transparent prize
                distribution through
                smart contracts with
                staking opportunities
              </p>
            </div>
          </div>
        </div>

        {/* How The Arena Works */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            How The <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Arena Works</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            From model upload to victory celebration - here's your path to ML glory
          </p>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">01</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Model</h3>
              <p className="text-gray-400">
                Upload your .zip with train.py,
                model.py, and requirements.txt
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">02</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Join Arena</h3>
              <p className="text-gray-400">
                Pay entry fee and enter the
                prediction tournaments
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">03</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Battle & Win</h3>
              <p className="text-gray-400">
                Compete in 5-minute intervals and
                earn reward points
              </p>
            </div>
          </div>
        </div>

        {/* Live Arena Preview */}
        <div className="bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Live Arena Preview</h2>
            <p className="text-gray-300">Watch models battle in real-time prediction contests</p>
          </div>
          
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div className="bg-purple-900/50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm font-semibold">WINNING</span>
              </div>
              <h3 className="text-xl font-bold mb-2">StockMaster Pro</h3>
              <div className="text-3xl font-bold text-green-400 mb-1">94.2% Accuracy</div>
              <div className="text-sm text-gray-400">127 Predictions</div>
            </div>
            
            <div className="bg-purple-900/50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                <span className="text-sm font-semibold">COMPETING</span>
              </div>
              <h3 className="text-xl font-bold mb-2">TrendFollower AI</h3>
              <div className="text-3xl font-bold text-yellow-400 mb-1">89.7% Accuracy</div>
              <div className="text-sm text-gray-400">89 Predictions</div>
            </div>
            
            <div className="bg-purple-900/50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                <span className="text-sm font-semibold">STRUGGLING</span>
              </div>
              <h3 className="text-xl font-bold mb-2">QuickPredict</h3>
              <div className="text-3xl font-bold text-red-400 mb-1">76.3% Accuracy</div>
              <div className="text-sm text-gray-400">43 Predictions</div>
            </div>
          </div>
          
          <div className="text-center">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 rounded-full font-semibold">
              Join Live Arena
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-purple-700/30 pt-12">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <span className="text-lg font-bold">ModelArena</span>
              </div>
              <p className="text-gray-400 text-sm">
                The premier ML model competition platform with real-time evaluation and blockchain rewards.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Upload Models</a></li>
                <li><a href="#" className="hover:text-white">Live Arena</a></li>
                <li><a href="#" className="hover:text-white">Leaderboard</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Discord</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">GitHub</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">API Docs</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-purple-700/30 text-center text-gray-400 text-sm">
            © 2025 ModelArena. Revolutionizing ML model evaluation through competitive gaming.
          </div>
        </footer>
      </main>
    </div>
  );
}