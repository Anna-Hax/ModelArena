import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Register from "./pages/register";
import ModelUpload from "./pages/modelUpload";
import Hackathonlanding from "./pages/hackathonLanding";
import Leaderboard from "./pages/leaderboard";
import ConnectWallet from "./pages/walletConnect";
import SendEtherPage from './pages/walletinfo';
import HackathonInfo from "./pages/HackathonInfo(blockchain)";
import JoinHackathon from "./pages/joinHackathon";
import RequireAuth from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext"; // ✅ Correct import

import './App.css';

const App = () => {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<RequireAuth />}>

            <Route path="/wallet" element={<ConnectWallet />} />
            <Route path="/UploadModel" element={<ModelUpload />} />
            <Route path="/home" element={<Home />} />
            <Route path="/landing" element={<Hackathonlanding />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/wallet-info" element={<SendEtherPage />} />
            <Route path="/hack-info" element={<HackathonInfo />} />
            <Route path="/hack-join" element={<JoinHackathon />} />
          </Route>
        </Routes>
      </Router>
    </WalletProvider>

  );
};

export default App;
