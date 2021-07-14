import React, { Component } from "react";
import { Web3Context } from "../web3-context";
import RegistrationBL from "../businessLayer/RegistrationBL";
import VotingBL from "../businessLayer/VotingBL";
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

    VoteBL = new VotingBL();


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
            , voted: null
            , proof:""
        }

        this.ballotBL.getBallotStatement().then(returnValue => {
            this.setState({ ballotValue: returnValue });
        })
        this.ballotBL.getOption1().then(returnValue => {
            this.setState({ option0: returnValue });
        })
        this.ballotBL.getOption2().then(returnValue => {
            this.setState({ option1: returnValue });
        });
        this.handleClickVote = this.handleClickVote.bind(this);
    }

    componentDidMount = async () => {

        //let deposit = await this.BL.getMinimumDeposit()
        //this.setState({registered: await this.BL.register(this.context.account[0], deposit)})
        this.setState({ registered: await this.BL.isRegistered(this.context.account[0]) })
        this.setState({ voted: await this.VoteBL.hasVoted(this.context.account[0]) })
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

    handleClickVote = async(event) =>
    {  // submit vote button handler
        event.preventDefault();
        if (vote == null) {  // if no option was selected
            alert("Please make a selection!");
        } else { // an option was selected, continue to smart contract
            //Call business layer of voting 
            console.log(vote)

            this.VoteBL.generate1outOf2Proof(this.context.account[0]
                ,vote).then(response=> {this.setState({proof:response});console.log(response); 
                 this.VoteBL.submitVote(this.context.account[0] , vote ,response ).then(response=> {this.setState({voted:response}); console.log(response)})
            })
            
            this.setState({ flagVote: true });
            
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
        console.log("has voted ?" + this.state.voted);

        return (

            <div>
                {!this.state.ballotValue && this.state.ballotValue !== "null" && // shows when there is no ballot created
                    <div style={{ margin: 60 }}>
                        <h2 className="head text-center">No election was started yet</h2>
                        <div className="illust-wrapper">
                            <img className="illustration center" src={emptyimg} alt=""></img>
                        </div>
                    </div>
                }
                {!this.state.eligible && this.state.ballotValue && this.state.eligible !== null && this.state.ballotValue !== "null" &&//not eligible to vote
                    <div style={{ margin: 60 }}>
                        <h2 className="alert text-center">Ineligible members cannot register or vote</h2>
                        <div className="illust-wrapper">
                            <img className="center illustration" src={deniedimg} alt=""></img>
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


                {this.state.registered && this.state.ballotValue && this.state.eligible && !this.state.timeToVote && this.state.timeToVote !== null &&//shown if registered but the voting phase has not begun
                    <div>
                        <img className="center vote-soon" src={voteimg} alt=""></img>
                        <div>
                            <h2 id="vote-soon" className="success text-center">Registeration Successful</h2>
                            <hr />
                            <h2 id="vote-soon" className="head text-center">Voting Starts Soon<br></br>Please come again later</h2>
                            <br />
                        </div>
                    </div>
                }


                {!flagVote && this.state.ballotValue && this.state.registered && this.state.eligible && this.state.timeToVote && !this.state.voted&&//if time has begun --BUG--
                    // shows when address is registered and there is a running ballot
                    <div className="m-5 " >
                        <div className="center text-center" style={{ width: "40%" }}>
                            <h2 className="head">Please cast your vote</h2>
                            <hr />

                            <input onClick={() => this.setVote(0)} style={{ visibility: "hidden" }} type="radio" className="btn-check" name="vote" id="option1" autocomplete="off"></input>
                            <label onClick={() => this.setVote(0)} className="btn btn-block" for="option1">{this.state.option0}</label>


                            <input onClick={() => this.setVote(1)} style={{ visibility: "hidden" }} type="radio" className="btn-check" name="vote" id="option2" autocomplete="off"></input>
                            <label onClick={() => this.setVote(1)} className="btn btn-block" for="option2">{this.state.option1}</label>

                            <hr />

                            <input style={{border:"1px solid #1C437A"}} onClick={this.handleClickVote} className="m-5 votebutton" type="image" alt="Vote"
                                src={votebutton}>
                            </input>
                        </div>
                    </div>
                }

                {this.state.voted&& //everything finished 
                    <h2 className="center success text-center">
                        Thank you for voting!
                    </h2>
                }
            </div>
        );
    }
}

export default Vote;