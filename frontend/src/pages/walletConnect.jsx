import Web3Modal from "web3modal";
import {ethers} from "ethers";
//import { coinbasewallet } from "web3modal/dist/providers/connectors";
import { createCoinbaseWalletSDK } from "@coinbase/wallet-sdk"
const providerOptions = {
    coinbasewallet: {
        package: createCoinbaseWalletSDK,
        options: {
            appName: "ModelArena",
            infuraId: {3: "https://ropsten.infuria.io/v3/fefnefnesfe"}
        }

    }
}

function Wallet() {
    async function connectWallet() {
        try{
            let web3Modal = new Web3Modal({
                cacheProvider: false,
                providerOptions,
            });
            const web3ModalInstance = await web3Modal.connect();
            // eslint-disable-next-line no-unused-vars
            const web3ModalProvider = new ethers.providers.Web3Provider(web3ModalInstance);

            alert('Wallet connected')
            //console.log(web3ModalProvider);
        } catch(error){
            console.log("Error: ", error)
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Web3Modal Connection</h1>
                <button onClick={connectWallet}>
                    Connect Wallet
                </button>
            </header>
        </div>
    )
}

export default Wallet;