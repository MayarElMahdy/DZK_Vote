import web3 from "web3";

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
        const ec = new EC('secp256k1')
        // Generate voting keys
        const key = ec.genKeyPair()
        const pubPoint = key.getPublic()
        const x = pubPoint.getX()
        const y = pubPoint.getY()
        const pubKey = [web3.utils.numberToHex(x), web3.utils.numberToHex(y)]
        const privKey = web3.utils.numberToHex(key.priv)
        this.setCookie(address, privKey, {secure: true});
        // generate random key for proving
        const rand = ec.genKeyPair()
        const privRand = web3.utils.numberToHex(rand.priv)
        // you should NEVER send transaction using .send() to this contract only use it locally .call()
        const proof = await this.ZkpContract.methods.createZKP(privKey, privRand, pubKey).call({from: address});
        const reconProof = proof.map(function (e) {
            e = web3.utils.numberToHex(e);
            return e;
        });
        const r = reconProof[0]
        const vG = reconProof.slice(1, 4);
        try {
            const success = await this.votingContract.methods.register(pubKey, vG, r).call({
                from: address,
                value: deposit,
                gasLimit: 1865390
            });
            if (success) {
                await this.votingContract.methods.register(pubKey, vG, r).send({
                    from: address,
                    value: deposit,
                    gasLimit: 1865390
                });
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    setCookie(name, value, options = {}) {
        options = {
            path: '/',
            // add other defaults here if necessary
            ...options
        };

        if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString();
        }

        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }

        document.cookie = updatedCookie;
    }
}