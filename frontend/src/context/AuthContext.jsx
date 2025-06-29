import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from "axios";

const UserContext = createContext();

export const UserContextProvider = ({children}) => {
    const [userData, setUserData] = useState(null);
    const fetchUserData = async () => {
        try{
            const response = await axios.get("http://localhost:8000/auth/get_user/");
            // console.log(response.data);
            setUserData(response.data);
        }catch(error)
        {
            console.log("user not logged in", error);
            // console.log(error);
            setUserData(null);
        }
    }

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <UserContext.Provider value={{userData, setUserData, fetchUserData }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);