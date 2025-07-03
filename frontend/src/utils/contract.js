import * as ethers from "ethers";
import ArenaABI from "../abis/Arena.json";

const CONTRACT_ADDRESS = "0x574c0D83dDAD9Bc1f6b881d9d08525ebE574BBE1";

export const getArenaContract = async () => {
  if (!window.ethereum) throw new Error("Wallet not found");

  
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();

  return new ethers.Contract(CONTRACT_ADDRESS, ArenaABI.abi, signer);
};
