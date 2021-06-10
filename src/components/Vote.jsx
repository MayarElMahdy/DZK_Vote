import React, {Component} from "react";
import {Web3Context} from "../web3-context";
import RegistrationBL from "../businessLayer/RegistrationBL";
import votebutton from "./images/vote-icon.png";
import './Vote.css';

let option0 = "First Option"; // variables for the two options temporarily
let option1 = "Second Option";
let vote = null;

class Vote extends Component {
    static contextType = Web3Context;
    BL = new RegistrationBL();

    constructor(props) {
        super(props);

        this.state = {
            name: "React",
            flagBallot: false,
            flagVote: false,

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

                {this.state.registered &&    // shows when address is not registered
                // note: will reverse later registered flag later
                // should be !this.state.registered
                <div>
                    <h2 className = "head">You are not registered to vote yet.</h2>
                    <hr/>
                    <br/>

                </div>}

                {!flagVote && !this.state.registered &&  // shows when address is registered
                // note: will reverse later registered flag later
                <form id="voteform">
                    <h2 className = "head">
                        Please cast your vote: </h2>
                    <hr/>
                    <div>
                        <label class="container"> {option0}
                            <input onClick={() => this.setVote(0)} type="radio" value="0" name="vote"/> 
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <br/>
                    <div>
                        <label class="container"> {option1}
                            <input onClick={() => this.setVote(1)} type="radio" value="1" name="vote"/>
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <hr/>
                    <input onClick={this.handleClickVote} className = "votebutton" type = "image" alt = "Vote"
                    src= {votebutton} > 
                    </input>
                    
                </form>
                }

                {flagVote &&
                <h2 style={{margin: 60}}>
                    Thank you for voting!
                </h2>
                }

            </div>
        );
    }
}

export default Vote;