import getWeb3 from "./getWeb3";
import VotingContract from "./contracts/VotingSys.json";
import localZkpContract from "./contracts/ProofZKP_Local.json";
import React from "react";


export const Web3Context = React.createContext({web3: null, account: null});

export let localCryptoContract = null;

export async function loadWeb3() {
    try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = VotingContract.networks[networkId];
        window.votingContract = new web3.eth.Contract(
            VotingContract.abi,
            deployedNetwork && deployedNetwork.address,
        );
        window.localZkpContract = new web3.eth.Contract(localZkpContract.abi)
        // Set web3, accounts, and contract to a variable that will be assigned to the global context.
        return {web3: web3, account: accounts};

    } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
            `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
    }


}
