import React, {Component} from "react";
import {Link} from "react-router-dom";
import {Web3Context} from "../web3-context";
import RegistrationBL from "../businessLayer/RegistrationBL";

let option1 = "First Option"; // variables for the two options temporarily
let option0 = "Second Option";
let vote = null;

class Vote extends Component {
    static contextType = Web3Context;
    BL = new RegistrationBL();

    constructor(props) {
        super(props);

        this.state = {
            name: "React",
            flagBallot: false,
            flagVote: true,

            test: "1"
        };
        this.handleClickBallot = this.handleClickBallot.bind(this);
        this.handleClickVote = this.handleClickVote.bind(this);

    }

    componentDidMount = async () => {
        this.setState({test: await this.BL.isRegistered(this.context.account[0])})
    }


    handleClickBallot(event) {  // submit vote button handler
        event.preventDefault();
        this.setState({flagBallot: true});
        this.setState({flagVote: false});
        console.log("Ballot selected");
    }

    handleClickVote(event) {  // submit vote button handler
        event.preventDefault();
        if (vote == null) {  // if no option was selected
            alert("Please make a selection!");
        } else { // an option was selected, continue to smart contract
            this.setState({flagVote: true});
            // alert("Vote successful!");
        }
    }

    setVote(input) {  // function to set the value of the global variable 'vote'
        vote = input;
        console.log("Vote = " + vote);  // print the value of vote in the console
    }

    render() {
        const {flagBallot, flagVote} = this.state;
        return (

            <div>
                <h2>{this.state.test ? "yess" : "noo"}</h2>

                {!flagBallot &&    // shows ballot screen only when flagBallot = false
                <div>
                    <h2 style={{margin: 60}}>Select ballot:</h2>
                    <hr/>
                    <br/>
                    <hr/>
                    <input onClick={this.handleClickBallot} style={{marginLeft: 100}} type="submit"/>
                    <Link to="/" type="submit" className="Button"/>

                </div>}

                {!flagVote &&  // shows vote form after submitting ballot, if the flagVote = false
                <form id="voteform">
                    <h2 style={{margin: 60}}>
                        Please cast your vote:
                    </h2>

                    <hr/>
                    <div style={{marginLeft: 100}}>
                        <input onClick={() => this.setVote(0)} type="radio" value="0" name="vote"/> {option1}
                    </div>
                    <br/>
                    <div style={{marginLeft: 100}}>
                        <input onClick={() => this.setVote(1)} type="radio" value="1" name="vote"/> {option0}
                    </div>
                    <hr/>
                    <input onClick={this.handleClickVote} style={{marginLeft: 100}} type="submit"/>
                    <Link to="/" type="submit" className="Button"/>
                </form>
                }

                {flagVote && flagBallot &&
                <h2 style={{margin: 60}}>
                    Thank you for voting!
                </h2>
                }

            </div>
        );
    }
}

export default Vote;