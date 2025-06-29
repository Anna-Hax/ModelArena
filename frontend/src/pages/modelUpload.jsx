// import React, { useState } from "react";

// const ModelUpload = () => {
//     const [file, setFile] = useState(null);
//     const access = localStorage.getItem("access");

//     const handleFileChange = (e) => {
//         setFile(e.target.files[0]);
//     };

//     const handleUpload = async () => {
//         if (!file) {
//             alert("Please select a file to upload.");
//             return;
//         }

//         const formData = new FormData();
//         formData.append("model", file); // Must match the name in serializer

//         try {
//             const response = await fetch("http://localhost:8000/model/", {
//                 method: "POST",
//                 headers: {
//                     Authorization: `Bearer ${access}`,
//                     // ❌ DO NOT SET 'Content-Type' manually
//                 },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(`Upload failed: ${response.status} ${errorText}`);
//             }

//             const data = await response.json();
//             console.log("Upload success:", data);
//             navigate('/home');
//         } catch (error) {
//             console.error("Error during upload:", error);
//             alert("Upload failed.");
//         }
//     };

//     return (
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100vw" }}>
//             <h2>Upload Your Strategy Model</h2>
//             <input
//                 type="file"
//                 accept=".zip,.py"
//                 onChange={handleFileChange}
//                 style={{ width: "50%", padding: "8px", marginBottom: "10px" }}
//             />
//             <button
//                 style={{ width: "50%", padding: "8px", marginBottom: "10px" }}
//                 onClick={handleUpload}
//             >
//                 Upload Model
//             </button>
//         </div>
//     );
// };

// export default ModelUpload;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Add this line

const ModelUpload = () => {
    const [file, setFile] = useState(null);
    const access = localStorage.getItem("access");
    const navigate = useNavigate(); // ✅ Add this line

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("model", file); // Must match the name in serializer

        try {
            const response = await fetch("http://localhost:8000/model/", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access}`,
                    // ✅ Don't set Content-Type manually for FormData
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log("Upload success:", data);
            navigate('/home'); // ✅ Redirect after upload
        } catch (error) {
            console.error("Error during upload:", error);
            alert("Upload failed.");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100vw" }}>
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

export default ModelUpload;

