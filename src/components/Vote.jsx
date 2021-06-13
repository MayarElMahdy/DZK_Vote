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
            registered: false
            , eligible: false,
            registered2: false
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
        let deposit = await this.BL.getMinimumDeposit()
        this.setState({registered: await this.BL.register(this.context.account[0], deposit)})
        this.setState({registered2: await this.BL.isRegistered(this.context.account[0])})
        this.setState({eligible: await this.BL.isEligible(this.context.account[0])})
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
                <h6>{'eligible to vote: ' + (this.state.eligible ? 'yess' : 'noo')}</h6>
                <h6>{'did register : ' + (this.state.registered ? 'yess' : 'noo')}</h6>
                <h6>{'already registered: ' + (this.state.registered2 ? 'yess' : 'noo')}</h6>

                {!this.state.ballotValue &&     // shows when there is no ballot created
                <div style={{margin: 60}}>
                    <h2 className="head">No ballots available.</h2>
                </div>
                }
                {!this.state.eligible && this.state.ballotValue && //not eligible to vote
                <div style={{margin: 60}}>
                    <h2 className="head">You are not eligible to cast your vote nor register. </h2>
                    <hr/>
                    <br/>
                </div>
                }
                {this.state.eligible && this.state.ballotValue && //You are eligible to vote so please register
                <div style={{margin: 60}}>
                    <h2 className="head">You are eligible to vote please register first if you haven't </h2>
                    <hr/>
                    <br/>
                    <div>
                        <input type="submit"/>
                    </div>
                    <br></br>
                </div>
                }


                {this.state.registered && this.state.ballotValue && this.state.eligible && //shown if registered but the voting phase has not begun
                <div style={{margin: 60}}>
                    <h2 className="head">The voting phase has not yet begun please come again later</h2>
                    <hr/>
                    <br/>

                </div>
                }


                {!flagVote && this.state.ballotValue && this.state.registered && this.state.eligible &&
                // shows when address is registered and there is a running ballot
                <form id="voteform">
                    <h2 className="head">
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
                    <input onClick={this.handleClickVote} className="votebutton" type="image" alt="Vote"
                           src={votebutton}>
                    </input>

                </form>
                }

                {flagVote &&
                <h2 className="head">
                    Thank you for voting!
                </h2>
                }

            </div>
        );
    }
}

export default Vote;