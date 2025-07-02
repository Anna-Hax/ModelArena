import * as ethers from "ethers";
import ArenaABI from "../abis/Arena.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const getArenaContract = async () => {
  if (!window.ethereum) throw new Error("Wallet not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, ArenaABI.abi, signer);
};
