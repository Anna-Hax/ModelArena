//import * as ethers from "ethers";
//import ArenaABI from "../abis/Arena.json";
//
//const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
//
//export const getArenaContract = async () => {
//  if (!window.ethereum) throw new Error("Wallet not found");
//
//  const provider = new ethers.providers.Web3Provider(window.ethereum);
//  const signer = await provider.getSigner();
//
//  return new ethers.Contract(CONTRACT_ADDRESS, ArenaABI.abi, signer);
//};

import { ethers } from "ethers";
import ArenaABI from "../abis/ArenaABI.json";
//import TokenABI from "./TokenABI.json";      // optional, only if needed
//import StakingABI from "./StakingABI.json";  // optional, only if needed

const ARENA_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;;
//const TOKEN_CONTRACT_ADDRESS = "0xYourSepoliaTokenAddress";     // optional
//const STAKING_CONTRACT_ADDRESS = "0xYourSepoliaStakingAddress"; // optional

export const getArenaContract = (signerOrProvider = null) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = signerOrProvider || provider.getSigner();
  console.log(ARENA_CONTRACT_ADDRESS)
  return new ethers.Contract(ARENA_CONTRACT_ADDRESS, ArenaABI.abi, signer);
};

//export const getTokenContract = (signerOrProvider = null) => {
//  const provider = new ethers.providers.Web3Provider(window.ethereum);
//  const signer = signerOrProvider || provider.getSigner();
//  return new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TokenABI, signer);
//};
//
//export const getStakingContract = (signerOrProvider = null) => {
//  const provider = new ethers.providers.Web3Provider(window.ethereum);
//  const signer = signerOrProvider || provider.getSigner();
//  return new ethers.Contract(STAKING_CONTRACT_ADDRESS, StakingABI, signer);
//};