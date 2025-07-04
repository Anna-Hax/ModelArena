// frontend/src/components/HackathonInfo.jsx
import React, { useEffect, useState } from "react";
import { getArenaContract } from "../utils/contract";
import { ethers } from "ethers";

const HackathonInfo = () => {
  const [hackathon, setHackathon] = useState(null);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        const contract = await getArenaContract();
        const data = await contract.hackathons(0); // First hackathon
        setHackathon(data);
      } catch (error) {
        console.error("Error fetching hackathon:", error);
      }
    };
    fetchHackathon();
  }, []);

  if (!hackathon) return <p>Loading...</p>;

  return (
    <div>
      <h2>Hackathon #0</h2>
      <p>
        Start Time:{" "}
        {new Date(Number(hackathon.startTime) * 1000).toLocaleString()}
      </p>
      <p>
        End Time:{" "}
        {new Date(Number(hackathon.endTime) * 1000).toLocaleString()}
      </p>
      <p>
        Prize Pool: {ethers.utils.formatEther(hackathon.prizePool.toString())} ETH
      </p>
    </div>
  );
};

export default HackathonInfo;