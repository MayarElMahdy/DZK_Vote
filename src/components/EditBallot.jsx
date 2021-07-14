import React, { Component } from "react";
import { Web3Context } from "../web3-context";
import CreateBallotBL from "../businessLayer/CreateBallotBL";
import GlobalStatesBL from "../businessLayer/GlobalStatesBL";
import RegistrationBL from "../businessLayer/RegistrationBL";
import denied from "./images/denied.png"
import emptyimg from "./images/noballots.jpg"

//This is available only after the admin has created the ballot
class EditBallot extends Component {
    static contextType = Web3Context;
    // create the businessLayer class
    BL = new CreateBallotBL();
    GS = new GlobalStatesBL();
    RegBL = new RegistrationBL();

    constructor(props) {
        super(props);
        this.state = {
            txtfile: ""
            , errorsTxtfile: ""
            , value: ""
            , owner: true

        }
        this.BL.getBallotStatement().then(returnValue => {
            this.setState({ value: returnValue });
        })



        this.fileInput = React.createRef();

    }

    componentDidMount = async () => {
        this.setState({ owner: await this.GS.isOwner(this.context.account[0]) });

        await this.RegBL.finishRegistrationPhase(this.context.account[0]);
    }



    contactSubmit(e) {
        e.preventDefault();

        if (this.handleValidation()) {


            this.setState({ txtfile: "" });


        } else {
            alert("Form has errors.")
        }

    }


    handleChange(field, e) {
        let txtfile = this.state.txtfile;
        txtfile = e.target.value;
        this.setState({ txtfile });
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
        this.setState({ errorsTxtfile: errorsTxtfile });

        return formIsValid
    }


    render() {

        let labels = ["Ballot Name: ", "First Candidate: ", "Second Candidate: "];

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
                    <div className="text-center">
                        <h3 className="head text-center" style={{ margin: 60 }}>
                            Your current ballot statement is:  </h3>
                        <span className="spann">
                            {this.state.value.map((value, index) => {
                                return <h2 className="head text-center" key={index}>{labels[index] + value}</h2>
                            })
                            }
                        </span>
                        <hr></hr>
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