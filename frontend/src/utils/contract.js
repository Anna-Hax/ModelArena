import * as ethers from "ethers";
import ArenaABI from "../abis/Arena.json";

const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

export const getArenaContract = async () => {
  if (!window.ethereum) throw new Error("Wallet not found");

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts connected");
  }
  
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, ArenaABI.abi, signer);
};
