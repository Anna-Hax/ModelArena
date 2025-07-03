import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Register from "./pages/register";
import ModelUpload from "./pages/modelUpload";
import Hackathonlanding from "./pages/hackathonLanding";
import Leaderboard from "./pages/leaderboard";
import ConnectWallet from "./pages/walletConnect";
import SendEtherPage from "./pages/walletinfo";
import HackathonInfo from "./pages/HackathonInfo(blockchain)";
import JoinHackathon from "./pages/joinHackathon";
import RequireAuth from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import MLModelsBattle from "./pages/landingPage"
import "./App.css";

// ✅ Layout with Navbar
const ProtectedLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const App = () => {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="" element={<MLModelsBattle />} />
          {/* Protected routes */}
          <Route element={<RequireAuth />}>
            <Route
              path="/home"
              element={
                <ProtectedLayout>
                  <Home />
                </ProtectedLayout>
              }
            />
            <Route
              path="/UploadModel"
              element={
                <ProtectedLayout>
                  <ModelUpload />
                </ProtectedLayout>
              }
            />
            <Route
              path="/landing"
              element={
                <ProtectedLayout>
                  <Hackathonlanding />
                </ProtectedLayout>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedLayout>
                  <Leaderboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedLayout>
                  <ConnectWallet />
                </ProtectedLayout>
              }
            />
            <Route
              path="/wallet-info"
              element={
                <ProtectedLayout>
                  <SendEtherPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/hack-info"
              element={
                <ProtectedLayout>
                  <HackathonInfo />
                </ProtectedLayout>
              }
            />
            <Route
              path="/hack-join"
              element={
                <ProtectedLayout>
                  <JoinHackathon />
                </ProtectedLayout>
              }
            />
          </Route>
        </Routes>
      </Router>
    </WalletProvider>
  );
};

export default App;
