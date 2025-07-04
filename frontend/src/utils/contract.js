import * as ethers from "ethers";
import ArenaABI from "../abis/Arena.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export const getArenaContract = async () => {
  if (!window.ethereum) throw new Error("Wallet not found");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, ArenaABI.abi, signer);
};
