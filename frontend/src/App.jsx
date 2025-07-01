import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Register from "./pages/register";
import ModelUpload from "./pages/modelUpload";

import Hackathonlanding from "./pages/hackathonLanding";
import Leaderboard from "./pages/leaderboard";
import { UserContextProvider } from "./context/AuthContext";
import Wallet from "./pages/walletConnect";
import './App.css';

const App = () => {
  return (
    <UserContextProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/UploadModel" element={<ModelUpload />} />
          <Route path="/home" element={<Home />} />
          <Route path="/landing" element={<Hackathonlanding />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/wallet" element={<Wallet />} />
        </Routes>
      </Router>
    </UserContextProvider>
  );
};

export default App;
