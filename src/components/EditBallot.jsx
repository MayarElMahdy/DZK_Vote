import React, {Component} from "react";
import {Web3Context} from "../web3-context";
import CreateBallotBL from "../businessLayer/CreateBallotBL";
import GlobalStatesBL from "../businessLayer/GlobalStatesBL";
import RegistrationBL from "../businessLayer/RegistrationBL";
import denied from "./images/denied.png"
import emptyimg from "./images/noballots.jpg"
import VotingBL from "../businessLayer/VotingBL";

//This is available only after the admin has created the ballot
class EditBallot extends Component {
    static contextType = Web3Context;
    // create the businessLayer class
    BL = new CreateBallotBL();
    GS = new GlobalStatesBL();
    regBL = new RegistrationBL(window.votingContract, window.localZkpContract);
    BL2 = new VotingBL();

    constructor(props) {
        super(props);
        this.state = {
            txtfile: ""
            , errorsTxtfile: ""
            , value: ""
            , owner: true
            , finishRegistration: false

        }
        this.BL.getBallotStatement().then(returnValue => {
            this.setState({value: returnValue});
        })


        this.fileInput = React.createRef();

    }

    componentDidMount = async () => {
        this.setState({owner: await this.GS.isOwner(this.context.account[0])});

    }

    finishRegistration() {
        this.regBL.finishRegistrationPhase(this.context.account[0]).then(() => {
                this.setState({finishRegistration: true})
            }
        );
    }
    startTally = async() =>
    {
        await this.BL2.tally(this.context.account[0]);
    }


    contactSubmit(e) {
        e.preventDefault();

        if (this.handleValidation()) {


            this.setState({txtfile: ""});


        } else {
            alert("Form has errors.")
        }

    }


    handleChange(field, e) {
        let txtfile = this.state.txtfile;
        txtfile = e.target.value;
        this.setState({txtfile});
    }

    handleValidation() {

        let txtfile = this.state.txtfile;
        let errorsTxtfile = "";
        let formIsValid = true;

        if (!txtfile) {
            errorsTxtfile = "Please attach a text file !";
            formIsValid = false;
        }
        //make sure txt file is actually .txt
        var textfile = /text.*/;

        var file = document.querySelector('input[type=file]').files[0];

        if (!file.type.match(textfile)) {
            formIsValid = false;
            errorsTxtfile = "The selected file is not text file !";
        }

        //read the file and add the addresses 
        let reader = new FileReader();
        let content = "";
        let eligible = this.eligible;
        reader.onload = function (event) {
            content = event.target.result;

            eligible = content.split("\r\n");  // Addresses are seperated by space 
            console.log(eligible);
            this.BL.addEligible(this.context.account[0], eligible).then(response => alert(response));


        }.bind(this)
        reader.readAsText(file);
        this.setState({errorsTxtfile: errorsTxtfile});

        return formIsValid
    }


    render() {

        let labels = ["Ballot Statement: ", "First Option: ", "Second Option: "];

        return (
            <div>

                {!this.state.owner &&
                    <div style={{ margin: 60 }}>
                        <h2 className="alert text-center">Only the admin can edit a ballot</h2>
                        <div className="illust-wrapper">
                            <img className="illustration center" src={denied}></img>
                        </div>
                    </div>

                }
                {this.state.value && this.state.owner &&

                    <div className="m-5">

                        <div>
                            <h3 className="head">Ballot Settings</h3>
                        </div>
                        <hr></hr>
                        <div className="text-center">
                            <h3 className="head text-center">
                                Your current ballot is:  </h3>
                            <span className="spann text-center">
                                {this.state.value.map((value, index) => {
                                    return <h2 className="head text-center" key={index}>{labels[index] + value}</h2>
                                })
                                }
                            </span>
                        </div>
                        <form onSubmit={this.contactSubmit.bind(this)} style={{ margin: 100 }} className="form">
                            <div className="head" style={{ fontSize: "18px" }}>
                                <label htmlFor="myfile">Please insert the new list of voters :  &emsp;&emsp; </label>

                                <input type="file" id="myfile" name="myfile" onChange={this.handleChange.bind(this, "txtfile")}
                                    value={this.state.txtfile} ref={this.fileInput} />
                                <span style={{ color: "red" }}>{this.state.errorsTxtfile}</span>
                            </div>
                            <br></br> <br></br>
                            <input className="btn submit-button" type="submit" value="Add Voters" />
                        </form>
                        <br></br><br></br><br></br><br></br><br></br><br></br>

                        <div>
                            <h3 className="head">Election settings</h3>
                        </div>
                        <hr></hr>
                        <div >
                            <div className="row">
                                <h4 style={{ color: "red" }}>Danger Zone:&nbsp;</h4>
                                <h4 className="head">By clicking this button registration phase closes and the voting phase begins </h4>
                            </div>
                            <div className="center text-center" style={{ width: "40%" }}>
                                <br></br><br></br>
                                <button onClick={() => this.finishRegistration()} type="button" class="btn btn-danger btn-block">Start Election</button>
                                <br></br><br></br><br></br><br></br><br></br><br></br>
                                <br></br><br></br><br></br><br></br><br></br><br></br>
                            </div>
                        </div>
                        <div>
                            <h3 className="head">Tally settings</h3>
                        </div>
                        <hr></hr>
                        <div >
                            <div className="row">
                                <h4 style={{ color: "red" }}>Danger Zone:&nbsp;</h4>
                                <h4 className="head">By clicking this button Tally begins </h4>
                            </div>
                            <div className="center text-center" style={{ width: "40%" }}>
                                <br></br><br></br>
                                <button onClick={() => this.startTally()} type="button" class="btn btn-danger btn-block">Start Election</button>
                                <br></br><br></br><br></br><br></br><br></br><br></br>
                                <br></br><br></br><br></br><br></br><br></br><br></br>
                            </div>
                        </div>
                    </div>

                }
                {!this.state.value && this.state.owner &&
                    <div style={{ margin: 60 }}>
                        <h2 className="head text-center">You didn't create any ballots yet!</h2>
                        <div className="illust-wrapper">
                            <img className="illustration center" src={emptyimg}></img>
                        </div>
                    </div>

                }
            </div>

        );
    }
}

export default EditBallot;