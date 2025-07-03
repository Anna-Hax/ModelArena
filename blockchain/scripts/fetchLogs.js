import { JsonRpcProvider } from "ethers";

// Connect to the Ethereum network
const provider = new JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/5YAZvezwXXtIqbzLFtVCu");

// Get logs
const filter = {};

const logs = await provider.getLogs(filter);

console.log(logs);