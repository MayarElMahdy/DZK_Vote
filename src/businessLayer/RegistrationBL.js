const EC = require('elliptic').ec;

export default class RegistrationBL {
    votingContract = window.votingContract;
    ZkpContract = window.localZkpContract;

    // returns boolean if user is eligible to vote or not
    async isEligible(address) {
        return await this.votingContract.methods.eligible(address).call()
    }

    // returns boolean if user is registered or not
    async isRegistered(address) {
        return await this.votingContract.methods.registered(address).call()
    }

    // returns Integer of minimum deposit to register
    async getMinimumDeposit() {
        return parseInt(await this.votingContract.methods.minDeposit().call());
    }

    // takes: address:String , deposit:Integer
    async register(address, deposit) {

    }
}