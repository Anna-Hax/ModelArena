import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
//import axios from "axios";

const RequireWallet = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      navigate("/login");
      return;
    }

    const wallet = localStorage.getItem('wallet_connect');
      if (wallet == false){
        navigate('/wallet')
      }
  //return <Outlet />; 
    })
}

export default RequireWallet;