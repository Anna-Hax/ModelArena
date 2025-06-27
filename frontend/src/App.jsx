import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import { UserContextProvider } from "./context/AuthContext";

const App = () => {
  return (
    <UserContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/*<Route path="/home" element={<Home />} />*/}
        </Routes>
      </Router>
    </UserContextProvider>
  );
};

export default App;
