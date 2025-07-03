import * as ethers from "ethers";
import ArenaABI from "../abis/Arena.json";

const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

export const getArenaContract = async () => {
  if (!window.ethereum) throw new Error("Wallet not found");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, ArenaABI.abi, signer);
};
