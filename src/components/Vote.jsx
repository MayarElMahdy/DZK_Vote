import React, { Component } from "react";
import { Web3Context } from "../web3-context";
import RegistrationBL from "../businessLayer/RegistrationBL";
import votebutton from "./images/vote-icon.png";
import './Vote.css';
import CreateBallotBL from "../businessLayer/CreateBallotBL";
import GlobalStatesBL from "../businessLayer/GlobalStatesBL";
import { PHASE } from "../App";
import voteimg from "./images/4585.jpg"
import deniedimg from "./images/denied.png"
import emptyimg from "./images/noballots.jpg"

let vote = null;

class Vote extends Component {
    static contextType = Web3Context;
    BL = new RegistrationBL();
    ballotBL = new CreateBallotBL();

    GL = new GlobalStatesBL();


    constructor(props) {
        super(props);

        this.state = {
            name: "React",
            flagVote: false,
            ballotValue: "null",
            option0: "First Option",
            option1: "Second Option",

            registered: null
            , eligible: null,
            timeToVote: null //If time for registration finished , Voting phase started
            , timeToReg: null
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

        //let deposit = await this.BL.getMinimumDeposit()
        //this.setState({registered: await this.BL.register(this.context.account[0], deposit)})
        this.setState({ registered: await this.BL.isRegistered(this.context.account[0]) })
        this.setState({ eligible: await this.BL.isEligible(this.context.account[0]) })
        this.setState({ timeToReg: await this.GL.inPhase(PHASE.REGISTER) })
        this.setState({ timeToVote: await this.GL.inPhase(PHASE.VOTE) })
    }

    register = async (e) =>  //Function to register 
    {
        e.preventDefault();
        let deposit = await this.BL.getMinimumDeposit()
        this.setState({ registered: await this.BL.register(this.context.account[0], deposit) })
        alert((this.state.registered ? 'Successful registration' : 'Unsuccessful registration'));

        //this.setState({registered:true});
    }

    handleClickVote(event) {  // submit vote button handler
        event.preventDefault();
        if (vote == null) {  // if no option was selected
            alert("Please make a selection!");
        } else { // an option was selected, continue to smart contract
            this.setState({ flagVote: true });
            // alert("Vote successful!");
        }
    }

    setVote(input) {  // function to set the value of the global variable 'vote'
        vote = input;
        console.log("Vote = " + vote);  // print the value of vote in the console
    }

    render() {

        const { flagVote } = this.state;
        console.log("ballot value ? " + this.state.ballotValue);
        console.log("is registered ? " + this.state.registered);
        console.log("is eligible ? " + this.state.eligible);
        console.log("is voting phase ? " + this.state.timeToVote);
        console.log("is registeration phase ? " + this.state.timeToReg);

        return (

            <div>
                {!this.state.ballotValue && this.state.ballotValue !== "null" &&  // shows when there is no ballot created
                    <div style={{ margin: 60 }}>
                        <h2 className="head text-center">You didn't create any ballots yet!</h2>
                        <div style={{height:"100%"}}>
                        <img style={{width: "30%"}} className="center" src={emptyimg} alt=""></img>
                        </div>
                    </div>
                }
                {!this.state.eligible && this.state.ballotValue && this.state.eligible !== null && this.state.ballotValue !== "null" &&//not eligible to vote
                    <div style={{ margin: 60 }}>
                        <h2 className="alert text-center">Ineligible members cannot register or vote</h2>
                        <div>
                        <img style={{width: "30%"}} className="center" src={deniedimg} alt=""></img>
                        </div>
                    </div>
                }
                {this.state.eligible && this.state.ballotValue && !this.state.registered &&//You are eligible to vote so please register
                    <div style={{ margin: 60 }} >
                        <form onSubmit={this.register.bind(this)}>
                            <h2 className="head text-center">Please register first</h2>
                            <hr />
                            <br />
                            <div className="text-center">
                                <input className="btn submit-button btn-lg" type="submit" value="Register" />
                            </div>
                        </form>
                        <br></br>
                    </div>
                }


                {this.state.registered && this.state.ballotValue && this.state.eligible && !this.state.timeToVote &&//shown if registered but the voting phase has not begun
                    <div>
                        <h2 className="success text-center">Registeration Successful</h2>
                        <hr />
                        <h2 className="head text-center">Voting Starts Soon<br></br>Please come again later</h2>
                        <div style={{height:"100%", width:"100%"}}>
                        <img style={{width:"130%", marginLeft:"-50px"}} className="center" src={voteimg} alt=""></img>
                        </div>
                        <br />
                    </div>
                }


                {!flagVote && this.state.ballotValue && this.state.registered && this.state.eligible && this.state.timeToVote && //if time has begun --BUG--
                    // shows when address is registered and there is a running ballot
                    <form id="voteform">
                        <h2 className="head">
                            Please cast your vote: </h2>
                        <hr />
                        <div>
                            <label class="container-vote"> {this.state.option0}
                                <input onClick={() => this.setVote(0)} type="radio" value="0" name="vote" />
                                <span class="checkmark"></span>
                            </label>
                        </div>
                        <br />
                        <div>
                            <label class="container-vote"> {this.state.option1}
                                <input onClick={() => this.setVote(1)} type="radio" value="1" name="vote" />
                                <span class="checkmark"></span>
                            </label>
                        </div>
                        <hr />
                        <input onClick={this.handleClickVote} className="votebutton" type="image" alt="Vote"
                            src={votebutton}>
                        </input>

                    </form>
                }

                {flagVote && //everything finished 
                    <h2 className="head text-center">
                        Thank you for voting!
                    </h2>
                }
            </div>
        );
    }
}

export default Vote;