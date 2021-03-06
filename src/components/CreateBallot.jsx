import React, { Component } from "react";
import { Web3Context } from "../web3-context";
import CreateBallotBL from "../businessLayer/CreateBallotBL";
import GlobalStatesBL from "../businessLayer/GlobalStatesBL";
import deniedimg from "./images/denied.png"

class CreateBallot extends Component {

    static contextType = Web3Context;
    // create the businessLayer class
    BL = new CreateBallotBL();
    GS = new GlobalStatesBL();

    constructor(props) {
        super(props)
        this.state = {
            account: ''
            , fields: {}
            , errors: {}
            , value: [] // Used to show the ballot's confirmation
            , eligible: ""
            , transaction: ""
            , owner: null
        }
        this.BL.getBallotStatement().then(returnValue => {
            this.setState({ value: returnValue });
        })

        this.fileInput = React.createRef();
    }

    componentDidMount = async () => {
        this.setState({ owner: await this.GS.isOwner(this.context.account[0]) });
    }

    contactSubmit(e) {
        e.preventDefault();

        if (this.handleValidation()) {

            this.setState({ ballot: false });
            this.setState({ ballot_confirm: true });


        } else {
            alert("Form has errors.")
        }

    }


    handleChange(field, e) {
        let fields = this.state.fields;
        fields[field] = e.target.value;
        this.setState({ fields });
    }


    handleValidation() {
        let fields = this.state.fields;
        let errors = {};
        let formIsValid = true;
        let today = new Date();

        //check if fields is not empty 
        formIsValid = this.handleEmpty("BallotName", formIsValid, fields, errors, 1);
        formIsValid = this.handleEmpty("Cand1", formIsValid, fields, errors, 1);
        formIsValid = this.handleEmpty("Cand2", formIsValid, fields, errors, 1);

        //handle date/time empty fields 
        formIsValid = this.handleEmpty("date_Reg_start", formIsValid, fields, errors, 2);
        formIsValid = this.handleEmpty("Time_Reg_start", formIsValid, fields, errors, 3);
        formIsValid = this.handleEmpty("date_Reg_end", formIsValid, fields, errors, 2);
        formIsValid = this.handleEmpty("Time_Reg_end", formIsValid, fields, errors, 3);


        //check if txt file is not attached
        formIsValid = this.handleEmpty("txtfile", formIsValid, fields, errors, 4);

        var date1 = new Date(fields["date_Reg_start"]);
        var date2 = new Date(fields["date_Reg_end"]);

        // we need to compare with current date 
        //first we need to switch the fields to become dates 

        if (date1.getTime() <= today.getTime()) {
            formIsValid = false;
            errors["date_Reg_start"] = "This date has already passed !";
        }
        if (date2.getTime() <= today.getTime()) {
            formIsValid = false;
            errors["date_Reg_end"] = "This date has already passed !";
        }


        if (fields["date_Reg_start"] >= fields["date_Reg_end"]) {
            formIsValid = false;
            errors["date_Reg_start"] = "Invalid date selected";
            errors["date_Reg_end"] = "Invalid date selected";
        }
        if (!formIsValid) //if empty fields , then dont continue the validation of txt file
        {
            this.setState({ errors: errors });
            return formIsValid;
        }

        //check if the uploaded file is txt file 

        var textfile = /text.*/;

        var file = document.querySelector('input[type=file]').files[0];

        if (!file.type.match(textfile)) {
            formIsValid = false;
            errors["txtfile"] = "The selected file is not text file !";
        }
        //read whole file
        //then adding each address to the 'eligible' array


        let reader = new FileReader();
        let content = "";
        let eligible = this.eligible;
        reader.onload = function (event) {
            content = event.target.result;

            eligible = content.split("\r\n");  // Addresses are seperated by newline


            //first change the date and time to unix 

            this.setState({ eligible: eligible });
            var start_date = this.state.fields["date_Reg_start"] + "T" + this.state.fields["Time_Reg_start"];
            var end_date = this.state.fields["date_Reg_end"] + "T" + this.state.fields["Time_Reg_end"];
            var unix_start_date = parseInt((new Date(start_date).getTime() / 1000).toFixed(0));
            var unix_end_date = parseInt((new Date(end_date).getTime() / 1000).toFixed(0));


            //call the create ballot 
            this.BL.creatBallot(this.context.account[0],
                this.state.fields["BallotName"],
                this.state.fields["Cand1"],
                this.state.fields["Cand2"],
                unix_start_date,
                unix_end_date,
                12,
                eligible).then(response => {
                    this.setState({ transaction: response });
                    console.log(response);

                    this.BL.getBallotStatement().then(returnValue => {
                        this.setState({ value: returnValue });
                    })
                })


        }.bind(this)
        reader.readAsText(file);


        this.setState({ errors: errors });

        return formIsValid;
    }

    handleEmpty(string, valid, fields, errors, num) {
        if (!fields[string]) {
            if (num === 1)
                errors[string] = "Empty field!";
            else if (num === 2)
                errors[string] = "Date is empty!";
            else if (num === 3)
                errors[string] = "Time is empty!";
            else
                errors[string] = "Please attach a text file!";

            return false;
        }
        return true;

    }


    render() {

        console.log("account " + this.state.account);
        console.log("errors " + this.state.errors);
        console.log("fields " + this.state.fields);
        console.log("is confirmed " + this.state.value);
        console.log("is eligible " + this.state.eligible);
        console.log("transaction " + this.state.transaction);
        console.log("owner " + this.state.owner);
        console.log("is ballot " + this.state.b);
        let labels = ["Ballot Name: ", "First Candidate: ", "Second Candidate: "];

        return (

            <div style={{ height: "100%" }} className="m-3">
                {!this.state.owner && this.state.owner != null &&
                    <div style={{ height: "100%", margin: 60 }}>
                        <h2 className="alert text-center">Only the Admin can create ballots</h2>
                        <div className="illust-wrapper">
                            <img className="illustration center" src={deniedimg} alt=""></img>
                        </div>
                    </div>
                }

                {!this.state.value && this.state.owner && // show when ballot is not yet created
                    <div>


                        <form onSubmit={this.contactSubmit.bind(this)} className="form">
                            <br />
                            <label htmlFor="Contract-name">Ballot Name</label>
                            <input type="text" id="Contract-name" name="Ballot Name" placeholder="Enter the name of ballot"
                                onChange={this.handleChange.bind(this, "BallotName")}
                                value={this.state.fields["BallotName"]} />
                            <span style={{ color: "red" }}>{this.state.errors["BallotName"]}</span>
                            <br />
                            <label htmlFor="Candidate-Name"> Write your options </label>
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <input type="text" id="Cand-1" name="Cand-1" placeholder="Enter the first option"
                                    onChange={this.handleChange.bind(this, "Cand1")} value={this.state.fields["Cand1"]} />
                                <input type="text" id="Cand-2" name="Cand-2" placeholder="Enter the second option"
                                    onChange={this.handleChange.bind(this, "Cand2")} value={this.state.fields["Cand2"]} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <span style={{ color: "red" }}>{this.state.errors["Cand1"]}</span>
                                <span style={{ color: "red" }}>{this.state.errors["Cand2"]}</span>
                            </div>
                            <br />
                            <label htmlFor="TimeStamps">Enter the timestamp of each phase : <br /> </label>
                            <br /><br />
                            <label htmlFor="Reg-Time" style={{ color: '#db1818' }}>&emsp;
                                <mark><b>Registration phase starts right after the ballot is created </b></mark>
                            </label>
                            <br /><br />
                            <label htmlFor="Reg-Time">Voting phase starts in: &emsp;</label>
                            <input id="date_Reg_Start" type="date" onChange={this.handleChange.bind(this, "date_Reg_start")}
                                value={this.state.fields["date_Reg_start"]} />

                            <input id="time_Reg_Start" type="time" onChange={this.handleChange.bind(this, "Time_Reg_start")}
                                value={this.state.fields["Time_Reg_start"]} />
                            <span style={{ color: "red" }}>{this.state.errors["date_Reg_start"]}</span>
                            <span style={{ color: "red" }}>{this.state.errors["Time_Reg_start"]}</span>

                            <label htmlFor="Reg-Time">&emsp;Voting phase ends in:&emsp;</label>
                            <input id="date_Reg_End" type="date" onChange={this.handleChange.bind(this, "date_Reg_end")}
                                value={this.state.fields["date_Reg_end"]} />
                            <input id="time_Reg_End" type="time" onChange={this.handleChange.bind(this, "Time_Reg_end")}
                                value={this.state.fields["Time_Reg_end"]} />
                            <span style={{ color: "red" }}>{this.state.errors["date_Reg_end"]}</span>
                            <span style={{ color: "red" }}>{this.state.errors["Time_Reg_end"]}</span>


                            <br />
                            <br />
                            <label htmlFor="Tally" style={{ color: '#db1818' }}>&emsp;
                                <mark><b>Tally phase starts automatically
                                    after the voting phase is over</b></mark>
                            </label>
                            <br /><br />

                            <label htmlFor="myfile">Select a text file containing the eligible voter's
                                addresses: &emsp;&emsp; </label>

                            <input type="file" id="myfile" name="myfile" onChange={this.handleChange.bind(this, "txtfile")}
                                value={this.state.fields["txtfile"]} ref={this.fileInput} />
                            <span style={{ color: "red" }}>{this.state.errors["txtfile"]}</span>
                            <br />
                            <br />
                            <input className="btn submit-button btn-lg ml-4" type="submit" value="Submit" />

                        </form>

                    </div>
                }

                {this.state.value && this.state.owner && this.state.transaction !== "Transaction Failed" && this.state.value !== [] &&// when creation is complete
                    <div className="text-center">
                        <br></br>
                        <h2 className="success text-center"> Ballot Successfully Created</h2>
                        <br></br><hr></hr><br></br>
                        <span className="spann">
                            {this.state.value.map((value, index) => {
                                return <h2 className="head text-center" key={index}>{labels[index] + value}</h2>
                            })
                            }</span>

                    </div>
                }

                {this.state.value && this.state.owner && this.state.transaction === "Transaction Failed" &&
                    <div>
                        <h2 className="success text-center">Error</h2>
                    </div>
                }
            </div>


        );
    }
}

export default CreateBallot;