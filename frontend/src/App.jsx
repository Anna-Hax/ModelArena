import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Register from "./pages/register";
import ModelUpload from "./pages/modelUpload";
import { UserContextProvider } from "./context/AuthContext";
import './App.css';

const App = () => {
  return (
    <UserContextProvider>
      <Router>f
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/UploadModel" element={<ModelUpload />} />
          <Route path="/home" element={<Home />} />

        </Routes>
      </Router>
    </UserContextProvider>
  );
};

export default App;
