import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("wallet_connect");
    navigate("/connect-wallet");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-purple-900 text-white p-4 flex justify-between items-center shadow-lg">

      <div className="text-xl font-bold">ModelArena</div>
      <div className="space-x-4 flex items-center">
        <Link to="/home" className="hover:underline">Home</Link>
        <Link to="/UploadModel" className="hover:underline">Upload</Link>
        <Link to="/leaderboard" className="hover:underline">Leaderboard</Link>
        <Link to="/wallet-info" className="hover:underline">Wallet Info</Link>
        <Link to="/wallet" className="hover:underline">Connect Wallet</Link>
        <Link to="/hack-info" className="hover:underline">Hack Info</Link>
        <Link to="/hack-join" className="hover:underline">Join</Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
