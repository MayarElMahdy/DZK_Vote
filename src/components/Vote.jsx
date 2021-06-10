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

            registered: "1"
        };
        this.handleClickVote = this.handleClickVote.bind(this);

    }

    componentDidMount = async () => {
        this.setState({registered: await this.BL.isRegistered(this.context.account[0])})
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
                <h2>{this.state.registered ? "yess" : "noo"}</h2>

                {!this.state.registered &&    // shows when address is not registered
                <div>
                    <h3 style={{margin: 60}}>You are not registered to vote yet.</h3>
                    <hr/>
                    <br/>

                </div>}

                {!flagVote && this.state.registered &&  // shows when address is registered
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