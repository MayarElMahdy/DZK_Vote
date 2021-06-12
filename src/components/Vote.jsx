import React, {Component} from "react";
import {Web3Context} from "../web3-context";
import RegistrationBL from "../businessLayer/RegistrationBL";
import votebutton from "./images/vote-icon.png";
import './Vote.css';
import CreateBallotBL from "../businessLayer/CreateBallotBL";

let vote = null;
class Vote extends Component {
    static contextType = Web3Context;
    BL = new RegistrationBL();
    ballotBL = new CreateBallotBL();
    
    constructor(props) {
        super(props);

        this.state = {
            name: "React",
            flagVote: false,
            ballotValue: "",
            option0: "First Option",
            option1: "Second Option",
            registered: "1"
        }
        this.ballotBL.getBallotStatement().then(returnValue => {
            this.setState({ballotValue: returnValue});
        })
        this.ballotBL.getOption1().then(returnValue => {
            this.setState({option0: returnValue});
        })
        this.ballotBL.getOption2().then(returnValue => {
            this.setState({option1: returnValue});
        });
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
        const {flagVote} = this.state;
        return (

            <div>
                <h2>{this.state.registered ? "yess" : "noo"}</h2>
                
                {!this.state.ballotValue &&     // shows when there is no ballot created
                <div>
                    <h2 className = "head">No ballots available.</h2>
                </div>
                }

                {!this.state.registered && this.state.ballotValue &&    // shows when address is not registered
                <div>
                    <h2 className = "head">You are not registered to vote yet.</h2>
                    <hr/>
                    <br/>

                </div>} 

                {!flagVote && this.state.ballotValue && this.state.registered &&  
                // shows when address is registered and there is a running ballot
                <form id="voteform">
                    <h2 className = "head">
                        Please cast your vote: </h2>
                    <hr/>
                    <div>
                        <label class="container"> {this.state.option0}
                            <input onClick={() => this.setVote(0)} type="radio" value="0" name="vote"/> 
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <br/>
                    <div>
                        <label class="container"> {this.state.option1}
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
                <h2 className = "head">
                    Thank you for voting!
                </h2>
                }

            </div>
        );
    }
}

export default Vote;