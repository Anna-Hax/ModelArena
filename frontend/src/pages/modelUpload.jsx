import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/AuthContext";
import axios from "axios";

const ModelUpload = () => {
    const { userData } = useUser();
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("uploadEndpoint", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            console.log(response.data);
        } catch (error) {
            console.error("Error occurred while uploading:", error);
        }
    };

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            flexDirection: 'column'
        }}>
            <div style={{
                width: "35vw",
                padding: "30px",
                height: "50vh",
                borderRadius: "12px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                textAlign: "center"
            }}>
                <h2 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "600" }}>
                    Upload Your Strategy Model
                </h2>
                <input
                    type="file"
                    accept=".zip,.py"
                    onChange={handleFileChange}
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "15px",
                        border: "1px solid #ccc",
                        borderRadius: "6px"
                    }}
                />
                <button
                    onClick={handleUpload}
                    style={{
                        width: "100%",
                        padding: "10px",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "500"
                    }}
                >
                    Upload Model
                </button>
            </div>
        </div>
    );
};

export default ModelUpload;
