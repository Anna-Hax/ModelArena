import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/AuthContext";
import axios from "axios";

const Login = () => {
    const navigate = useNavigate();
    const { setUserData } = useUser();

    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res1 = await axios.post("http://localhost:5173/api/token/", form)
            const { access, refresh } = res1.data;

            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);

            const hdr = {
                headers: {
                    Authorization: `Bearer ${access}`
                }
            };

            const res2 = await axios.post("http://localhost:5173/api/auth/users/get_user/", hdr);
            await setUserData(res2.data);
            navigate("/Home")
        }

        catch (error) {
            console.error("Error logging in user:", error);
        }
    }

    return (
        <div className="login-container" style={{display:"flex",flexDirection:"column", alignItems:"center", 
        justifyContent:"center", width: "100vw",  }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit} style={{display:"flex", flexDirection:"column", alignItems:"center",
                 justifyContent:"center", width:"600px", padding: "10px"}}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    style={{ width: "50%", padding: "8px", marginBottom: "10px" }}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    style={{ width: "50%", padding: "8px", marginBottom: "10px" }}
                    required
                />

                <button type="submit" style={{ width: "53%", padding: "8px", marginBottom: "10px" }}>
                    Login
                </button>

                <p>Don't have an account? <Link to="/register">Create Account</Link></p>
            </form>

        </div>
    );
}

export default Login