const lineByLine = require('n-readlines');

export default class CreateBallotBL {
    contract = window.votingContract;

    async creatBallot(adminAddress, ballotStatement, option1, option2, endRegistrationPhase, endVotingPhase,
                      depositRequired, addresses) {
        try {
            const success = await this.contract.methods.creatBallot(
                ballotStatement,
                option1,
                option2,
                endRegistrationPhase,
                endVotingPhase,
                depositRequired,
                addresses
            ).call({from: adminAddress});

            if (success) {
                await this.contract.methods.creatBallot(
                    ballotStatement,
                    option1,
                    option2,
                    endRegistrationPhase,
                    endVotingPhase,
                    depositRequired,
                    addresses
                ).send({from: adminAddress});
                return "Transaction Confirmed";
            } else {
                return "Transaction Failed";
            }
        } catch (e) {
            console.log(e.message);
            return "Transaction Failed";
        }
    }

    // edit as preferred
    async getBallotStatement() {
        return await  this.contract.methods.ballotName().call() + "\n\nCandidates are :\n \t" +
            await this.contract.methods.options(0).call() + " " +
            await this.contract.methods.options(1).call() ;
    }

    async addEligible(adminAddress, addresses) {
        try {
            const success = await this.contract.methods.addEligible(addresses).call({from: adminAddress});
            if (success) {
                await this.contract.methods.addEligible(addresses).send({from: adminAddress});
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.log(e.message);
            return false;
        }
    }

    // todo: not tested!!
    readAddressesFromFile(filePath) {
        const liner = new lineByLine(filePath);
        let line;
        const array = [];
        while (line = liner.next()) {
            array.push(line);
        }
        return array;
    }

    //Split the content of the file
    splitArray(array){
        var splitted = array.split(" "); 
        return splitted;
    }


}