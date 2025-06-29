import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
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
        </Routes>
      </Router>
    </UserContextProvider>
  );
};

export default App;
