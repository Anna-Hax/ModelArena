import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "axios";

const RequireWallet = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      navigate("/login");
      return;
    }

    axios.get("http://localhost:8000/auth/check_wallet/", {
      headers: { Authorization: `Bearer ${access}` },
    }).catch(() => navigate("/wallet"));
  }, [navigate]);

  //return <Outlet />; 
};

export default RequireWallet;