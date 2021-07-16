const VotingContract = artifacts.require("./VotingSys.sol");
const ProofZkpContract_local = artifacts.require("./ProofZKP_Local.sol");
const EC = require('elliptic').ec;

let totalGasUsed = 0;
let privKeys = [];
let totalTesting = 30;

let yesVotes = 0;
let noVotes = 0;

contract("Gas limits testing", async accounts => {
    it("Create ballot", async () => {
        const votingContract = await VotingContract.deployed();
        const res = await votingContract.creatBallot(
            "ballotStatement",
            "option1",
            "option2",
            1626865294,
            1626975294,
            12345,
            accounts
            , {
                from: accounts[0]
            })
        const gasUsed = res.receipt.gasUsed
        console.log("gas used to create ballot: " + gasUsed);
        totalGasUsed += gasUsed;
        const currPhase = (await votingContract.currentState()).toString();
        assert.equal(currPhase, '1', "phase changed successfully");
    });

    it("Register all accounts", async () => {
        const votingContract = await VotingContract.deployed();
        const localZkpContract = await ProofZkpContract_local.deployed();

        let registerTotalGas = 0;
        for (let i = 0; i < totalTesting; i++) {
            const ec = new EC('secp256k1')
            // Generate voting keys
            const key = ec.genKeyPair();
            const pubPoint = key.getPublic();
            const x = pubPoint.getX();
            const y = pubPoint.getY();
            const pubKey = [web3.utils.numberToHex(x), web3.utils.numberToHex(y)];
            const privKey = web3.utils.numberToHex(key.priv);
            privKeys[i] = privKey;
            // generate random key for proving
            const privRand = web3.utils.numberToHex(ec.genKeyPair().priv);
            // you should NEVER send transaction using .send() to this contract only use it locally .call()
            const proof = await localZkpContract.createZKP.call(privKey, privRand, pubKey, {from: accounts[i]});
            const reconProof = proof.map((e) => {
                e = web3.utils.numberToHex(e);
                return e;
            });
            const r = reconProof[0];
            const vG = reconProof.slice(1, 4);

            const res = await votingContract.register(pubKey, vG, r, {
                from: accounts[i],
                value: 12345,
                gasLimit: 1865390
            });
            const gasUsed = res.receipt.cumulativeGasUsed
            registerTotalGas += gasUsed;
            console.log("user " + i + " registered with gas used: " + gasUsed)

        }

        console.log("Total gas used to register: " + registerTotalGas);
        totalGasUsed += registerTotalGas;

    })

    it("Finish registration phase", async () => {
        const votingContract = await VotingContract.deployed();
        const res = await votingContract.finishRegistrationPhase({from: accounts[0]});
        const gasUsed = res.receipt.cumulativeGasUsed
        console.log("gas used to finish registration: " + gasUsed);
        totalGasUsed += gasUsed;
    });


    let votingTotalGas = 0;
    for (let i = 0; i < totalTesting; i++) {
        it("submit vote for user " + i, async () => {
            const choice = getRandomInt(2);
            if (choice) {
                yesVotes += 1;
            } else {
                noVotes += 1;
            }
            const proof = await generate1outOf2Proof(accounts[i], choice, privKeys[i]);
            const res = await submitVote(accounts[i], proof);
            const gasUsed = res.receipt.cumulativeGasUsed;
            votingTotalGas += gasUsed;
            console.log("user " + i + " voted " + choice + " with gas used: " + gasUsed);
            totalGasUsed += votingTotalGas;
        })
    }


    it("tally results", async () => {
        console.log("Total gas used in voting: " + votingTotalGas);
        const votingContract = await VotingContract.deployed();
        const res = await votingContract.computeTally({from: accounts[0]});
        const gasUsed = res.receipt.cumulativeGasUsed
        console.log("gas used to tally results: " + gasUsed);
        totalGasUsed += gasUsed;

        const votedYes = await votingContract.finalTally.call(0);
        const votedNo = await votingContract.finalTally.call(1) - votedYes;

        assert.equal(votedYes, yesVotes, "votes doesn't match");
        assert.equal(votedNo, noVotes, "votes doesn't match");
        console.log("total gas used for the whole process" + totalGasUsed);

    });

})


async function submitVote(address, proof) {
    const votingContract = await VotingContract.deployed();

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

    return await votingContract.submitVote(res2, y, a1, b1, a2, b2, {
        from: address,
        gasLimit: 6387876
    });

}

async function generate1outOf2Proof(address, choice, privKey) {
    const zkpContract = await ProofZkpContract_local.deployed();

    const contractVoterKeys = await getVoterKeys(address);

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
        return await zkpContract.create1outof2ZKPYesVote.call(pubKey, reconKey, w, r, d, privKey, {from: address});
    } else {
        return await zkpContract.create1outof2ZKPNoVote.call(pubKey, reconKey, w, r, d, privKey, {from: address});
    }
}

async function getVoterKeys(address) {
    const votingContract = await VotingContract.deployed();
    return await votingContract.getVoter.call({from: address});
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
