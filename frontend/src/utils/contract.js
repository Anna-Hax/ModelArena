import * as ethers from "ethers";
import ArenaABI from "../abis/Arena.json";

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const getArenaContract = async () => {
  if (!window.ethereum) throw new Error("Wallet not found");

  
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, ArenaABI.abi, signer);
};
