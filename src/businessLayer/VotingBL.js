import web3 from "web3";

const EC = require('elliptic').ec;


export default class VotingBL {
    votingContract = window.votingContract;
    ZkpContract = window.localZkpContract;

    async hasVoted(address) {
        return await this.votingContract.methods.voteCast(address).call()
    }

    // choice is either 0 or 1
    async generate1outOf2Proof(address, choice) {
        const privKey = this.getKeyFromCookies(address);

        const contractVoterKeys = await this.getVoterKeys(address);

        let pubKey = contractVoterKeys._registeredKey;
        pubKey = [web3.utils.numberToHex(pubKey[0]), web3.utils.numberToHex(pubKey[1])];

        let reconKey = contractVoterKeys._reconstructedKey;
        reconKey = [web3.utils.numberToHex(reconKey[0]), web3.utils.numberToHex(reconKey[1])];

        const ec = new EC('secp256k1');
        // Generate random numbers on elliptic curve, r is r1 or r2 depending on the choice, same for d
        const w = web3.utils.numberToHex(ec.genKeyPair().priv);
        const r = web3.utils.numberToHex(ec.genKeyPair().priv);
        const d = web3.utils.numberToHex(ec.genKeyPair().priv);

        if (choice) { // you should NEVER send transaction using .send() to this contract only use it locally using .call()
            return await this.ZkpContract.methods.create1outof2ZKPYesVote(pubKey, reconKey, w, r, d, privKey).call({from: address});
        } else {
            return await this.ZkpContract.methods.create1outof2ZKPNoVote(pubKey, reconKey, w, r, d, privKey).call({from: address});
        }
    }

    async submitVote(address, choice, proof) {
        
        const res = proof.res.map((e) => {
            e = web3.utils.numberToHex(e);
            return e;
        });

        const res2 = proof.res2.map((e) => {
            e = web3.utils.numberToHex(e);
            return e;
        });

        const y = res.slice(0, 2);
        const a1 = res.slice(2, 4);
        const b1 = res.slice(4, 6);
        const a2 = res.slice(6, 8);
        const b2 = res.slice(8, 10);

        try {
            await this.votingContract.methods.submitVote(res2, y, a1, b1, a2, b2).send({
                from: address,
                gasLimit: 6387876
            });

            return true;

        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async getVoterKeys(address) {
        return await this.votingContract.methods.getVoter().call({from: address});
    }


    getKeyFromCookies(address) {
        return this.getCookie(address);
    }

    async tally(address) {
        await this.votingContract.methods.computeTally().send({from: address});

    }

    async getTalliedResult(address) {
        const votedYes = await this.votingContract.methods.finalTally(0).call({from: address});
        const votedNo = (await this.votingContract.methods.finalTally(1).call({from: address})) - votedYes;
        return {votedYes: votedYes, votedNo: votedNo};
    }


    getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

};