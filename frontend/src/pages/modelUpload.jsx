import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/AuthContext";
import axios from "axios";

const ModelUpload = () => {
    const {userData} = useUser();
    const [file, setFile] = useState(null);
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }
    
    const handleUpload = async (e) => {
        const formData = new FormData();
        formData.append("file", file);

        try{
            const response = await axios.post("uploadEndpoint", formData, {
                headers: {'Content-Type': 'multipart/form-data'},
                withCredentials: true
            
            });
            console.log(response.data);
        }
        catch(error){
            console.error("Error occurred while uploading:", error);
        }
    }
    
    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            width: "100vw"
        }}>
            <h2>Upload Your Strategy Model</h2>
            <input
                type="file"
                accept=".zip,.py"
                onChange={handleFileChange}
                style={{ width: "50%", padding: "8px", marginBottom: "10px" }}
            />
            <button
                style={{ width: "50%", padding: "8px", marginBottom: "10px" }}
                onClick={handleUpload}
            >
                Upload Model
            </button>
        </div>
    );
};

export default ModelUpload
