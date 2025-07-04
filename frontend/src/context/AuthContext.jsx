// components/RequireAuth.jsx
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "axios";

const RequireAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      navigate("/login");
      return;
    }

    axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/get_user/`, {
      headers: { Authorization: `Bearer ${access}` },
    }).catch(() => navigate("/login"));
  }, [navigate]);

  return <Outlet />; 
};

export default RequireAuth;