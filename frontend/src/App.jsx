import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Register from "./pages/register";
import ModelUpload from "./pages/modelUpload";
import Hackathonlanding from "./pages/hackathonLanding";
import Leaderboard from "./pages/leaderboard";
import ConnectWallet from "./pages/walletConnect";
import SendEtherPage from './pages/walletinfo';

import { UserContextProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext"; // ✅ Correct import

import './App.css';

const App = () => {
  return (
    <UserContextProvider>
      <WalletProvider> {/* ✅ FIXED: Use correct context provider */}
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/UploadModel" element={<ModelUpload />} />
            <Route path="/home" element={<Home />} />
            <Route path="/landing" element={<Hackathonlanding />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/wallet" element={<ConnectWallet />} />
            <Route path="/wallet-info" element={<SendEtherPage />} />
          </Routes>
        </Router>
      </WalletProvider>
    </UserContextProvider>
  );
};

export default App;
