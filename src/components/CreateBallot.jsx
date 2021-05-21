import React, {Component} from "react";
import {Link} from "react-router-dom";
import {Web3Context} from "../web3-context";
import CreateBallotBL from "../businessLayer/CreateBallotBL";

class CreateBallot extends Component {

    static contextType = Web3Context;
    // create the businessLayer class
    BL = new CreateBallotBL();

    constructor(props) {
        super(props)
        this.state = {
            account: ''
            , fields: {}
            , errors: {}
            , ballot: true
            , ballot_confirm: false
            , value: "" // for testing -- dont forget to remove
        }

    }

    // for testing -- dont forget to remove
    componentDidMount = async () => {
        // example on how to call the BL of create ballot
        // Note: the time is in unix timestamp format
        // Note: the function that calls the BL should be asynchronous
        //       or call .then() on the BL function -example below-
        // Note: this can only be successfully called ONCE, to reassign you have to redeploy the contracts
        //       using [truffle migrate --reset]
        // the account of the current user is found in this.context.account[0] in all components
        const response = await this.BL.creatBallot(
            this.context.account[0],
            "momkn ad5ol anam?",
            "ahh",
            "yareet",
            1821494110,
            1921495110,
            5435,
            ["0x71FdB561640298a351180eDdd385BB9eD6f1C2bE",
                "0x347063ac4EaF85b5c953D523238db1B401046E5C",
                "0x01036d642512de49f2e72451500EBbF56773B0e6"]);
        console.log(response);
        this.setState({value: await this.BL.getBallotStatement()});

        /*
        * also could be written without the async function:
        * Note: async is better to allow adding loading animation easily in future
        *
        * this.BL.creatBallot(...).then(response => {
        *       console.log(response);
        *       this.BL.getBallotStatement().then(returnValue => {
        *            this.setState({value: returnValue});
        *       })
        * })
        *
        *
        * */

    }

    contactSubmit(e) {
        e.preventDefault();

        if (this.handleValidation()) {
            this.open_web3();

            this.setState({ballot: false});
            this.setState({ballot_confirm: true});
        } else {
            alert("Form has errors.")
        }

    }

    //todo: should be deleted?
    open_web3() {
        alert("Success");
    }

    handleChange(field, e) {
        let fields = this.state.fields;
        fields[field] = e.target.value;
        this.setState({fields});
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


        

        
        this.setState({errors: errors});
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
        const {ballot, ballot_confirm} = this.state;

        return (

            <div>

                {ballot && // show when ballot = true
                <div>
                    {/* for testing -- dont forget to remove */}
                    <h3>[test] ballot statement = {this.state.value} </h3>
                    <form onSubmit={this.contactSubmit.bind(this)} className="form">
                        <br/>
                        <label htmlFor="Contract-name">Ballot Name</label>
                        <input type="text" id="Contract-name" name="Ballot Name" placeholder="Enter the name of ballot"
                               onChange={this.handleChange.bind(this, "BallotName")}
                               value={this.state.fields["BallotName"]}/>
                        <span style={{color: "red"}}>{this.state.errors["BallotName"]}</span>
                        <br/>
                        <label htmlFor="Candidate-Name"> Write your options </label>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <input type="text" id="Cand-1" name="Cand-1" placeholder="Enter the first option"
                                   onChange={this.handleChange.bind(this, "Cand1")} value={this.state.fields["Cand1"]}/>
                            <input type="text" id="Cand-2" name="Cand-2" placeholder="Enter the second option"
                                   onChange={this.handleChange.bind(this, "Cand2")} value={this.state.fields["Cand2"]}/>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <span style={{color: "red"}}>{this.state.errors["Cand1"]}</span>
                            <span style={{color: "red"}}>{this.state.errors["Cand2"]}</span>
                        </div>
                        <br/>
                        <label htmlFor="TimeStamps">Enter the timestamp of each phase : <br/> </label>
                        <br/><br/>
                        <label htmlFor="Reg-Time" style={{color: '#db1818'}}>&emsp;
                            <mark><b>Registration for the ballot will start as soon as the ballot is created </b></mark>
                        </label>
                        <br/><br/>
                        <label htmlFor="Reg-Time">Voting phase start &emsp;</label>
                        <input id="date_Reg_Start" type="date" onChange={this.handleChange.bind(this, "date_Reg_start")}
                               value={this.state.fields["date_Reg_start"]}/>

                        <input id="time_Reg_Start" type="time" onChange={this.handleChange.bind(this, "Time_Reg_start")}
                               value={this.state.fields["Time_Reg_start"]}/>
                        <span style={{color: "red"}}>{this.state.errors["date_Reg_start"]}</span>
                        <span style={{color: "red"}}>{this.state.errors["Time_Reg_start"]}</span>

                        <label htmlFor="Reg-Time">&emsp;Voting phase end&emsp;</label>
                        <input id="date_Reg_End" type="date" onChange={this.handleChange.bind(this, "date_Reg_end")}
                               value={this.state.fields["date_Reg_end"]}/>
                        <input id="time_Reg_End" type="time" onChange={this.handleChange.bind(this, "Time_Reg_end")}
                               value={this.state.fields["Time_Reg_end"]}/>
                        <span style={{color: "red"}}>{this.state.errors["date_Reg_end"]}</span>
                        <span style={{color: "red"}}>{this.state.errors["Time_Reg_end"]}</span>

                        
                        
                        <br></br>
                        <br></br>
                        <label htmlFor="Tally" style={{color: '#db1818'}}>&emsp;
                            <mark><b> Tally phase will start automatically
                                after voting phase is over</b></mark>
                        </label>
                        <br/><br/>

                        <label htmlFor="myfile">Select a text file containing the eligible voter's
                            addresses: &emsp;&emsp; </label>

                        <input type="file" id="myfile" name="myfile" onChange={this.handleChange.bind(this, "txtfile")}
                               value={this.state.fields["txtfile"]}/>
                        <span style={{color: "red"}}>{this.state.errors["txtfile"]}</span>
                        <br/>
                        <br/>
                        <input type="submit"/>
                        <Link to="/" type="submit" className="Button">Create Ballot</Link>
                    </form>

                </div>
                }

                {ballot_confirm && // when creation is complete
                <h2 style={{margin: 60}}>
                    Ballot {this.state.fields["BallotName"]} is created !!
                </h2>

                }


            </div>


        );
    }
}

export default CreateBallot;