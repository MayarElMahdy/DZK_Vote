
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
            ).call({
                from: adminAddress,
                gasLimit: 598716
            });

            if (success) {
                await this.contract.methods.creatBallot(
                    ballotStatement,
                    option1,
                    option2,
                    endRegistrationPhase,
                    endVotingPhase,
                    depositRequired,
                    addresses
                ).send({ from: adminAddress, gasLimit: 598716 });
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
        let ballot = await this.contract.methods.ballotName().call();
        if (!ballot) // empty
            return "";
        else {
            let op1 = await this.contract.methods.options(0).call();
            let op2 = await this.contract.methods.options(1).call();
            let values = [ballot, op1, op2]
            return values;
        }

    }
    async getOption1() {
        return await this.contract.methods.options(0).call();
    }
    async getOption2() {
        return await this.contract.methods.options(1).call();
    }

    async addEligible(adminAddress, addresses) {
        try {
            const success = await this.contract.methods.addEligible(addresses).call({ from: adminAddress });
            if (success) {
                await this.contract.methods.addEligible(addresses).send({ from: adminAddress });
                return "Transaction Successful , All addresses inserted are now elligible to vote ! ";
            } else {
                return "Transaction Failed , Please try again";
            }
        } catch (e) {
            console.log(e.message);
            return "Error , Cannot add addresses ";
        }
    }



    //Split the content of the file
    splitArray(array) {
        return array.split(" ");
    }


}