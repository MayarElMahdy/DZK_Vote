export default class GlobalStatesBL {
    contract = window.votingContract;

    // checks if provided address is the owner/admin of the contract
    // returns: boolean
    async isOwner(address) {
        return address === await this.contract.methods.owner().call({from: address});
    }

    // checks if provided phase is the current phase
    // returns: boolean
    // usage: inPhase(PHASE.CREATE)
    // PHASE enum is defined in App.js, import using: import {PHASE} from "../App";
    async inPhase(phase) {
        return phase === parseInt(await this.contract.methods.currentState().call());
    }
};