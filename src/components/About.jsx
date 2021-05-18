import React, {Component} from "react";
import {Link} from "react-router-dom";                                                              
import {Web3Context} from "../web3-context";

class About extends Component {

    static contextType = Web3Context;

    constructor(props) {
        super(props)
        this.state = {
            account: ''
            , fields: {}
            , errors: {}
            , ballot: true
            , ballot_confirm: false

        }
    }

    handleValidation() {
        let fields = this.state.fields;
        let errors = {};
        let formIsValid = true;
        let today = new Date();
        let today_date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        //ballot name
        if (!fields["BallotName"]) {
            formIsValid = false;
            errors["BallotName"] = "Cannot be empty";
        }


        //Candidate 1
        if (!fields["Cand1"]) {
            formIsValid = false;
            errors["Cand1"] = "Cannot be empty";
        }

        //Candidate 2
        if (!fields["Cand2"]) {
            formIsValid = false;
            errors["Cand2"] = "Cannot be empty";
        }
        //Date of registration
        if (!fields["date_Reg_start"]) {
            formIsValid = false;
            errors["date_Reg_start"] = "Date is empty !";
        }
        //Time of registration
        if (!fields["Time_Reg_start"]) {
            formIsValid = false;
            errors["Time_Reg_start"] = "Time is empty !";
        }
        //Date of reg end
        if (!fields["date_Reg_end"]) {
            formIsValid = false;
            errors["date_Reg_end"] = "Date is empty !";
        }

        //Time of reg end
        if (!fields["Time_Reg_end"]) {
            formIsValid = false;
            errors["Time_Reg_end"] = "Time is empty !";
        }

        //Check the date between the start and end 

        if(fields["date_Reg_start"] >= fields["date_Reg_end"])
        {
            formIsValid= false;
            errors["date_Reg_start"] = "Invalid date selected";
            errors["date_Reg_end"] = "Invalid date selected";
        }


        if (!fields["date_vote_end"]) {
            formIsValid = false;
            errors["date_vote_end"] = "Date is empty !";
        }

        //Time of vote end
        if (!fields["Time_vote_end"]) {
            formIsValid = false;
            errors["Time_vote_end"] = "Time is empty !";
        }
        //Check date of the vote to be after both the start of registration and end 

        if(fields["date_vote_end"] <= fields["date_Reg_start"] || fields["date_vote_end"] <= fields["date_Reg_end"])
        {
            errors["date_vote_end"] = "Invalid date selected !";
        }

        // we need to compare with current date 
        if(fields["date_Reg_start"] <= today_date)
        {
            errors["date_Reg_start"] = "This date has already passed !";
        }
        if(fields["date_Reg_end"] <= today_date)
        {
            errors["date_Reg_end"] = "This date has already passed !";
        }
        if(fields["date_vote_end"] <= today_date)
        {
            errors["date_vote_end"] = "This date has already passed !" ;
        }


        if (!fields["txtfile"]) {
            formIsValid = false;
            errors["txtfile"] = "Please attach a text file !";
        }


        this.setState({errors: errors});
        return formIsValid;
    }

    contactSubmit(e) {
        e.preventDefault();

        if (this.handleValidation()) {
            
            this.setState({ ballot: false });
            this.setState({ballot_confirm: true});
        } else {
            alert("Form has errors.")
        }

    }

    handleChange(field, e) {
        let fields = this.state.fields;
        fields[field] = e.target.value;
        this.setState({fields});
    }

    render() {
        const { ballot, ballot_confirm } = this.state;
        
        return (

            <div>

                {ballot && // show when ballot = true 
                <div>
                    <h3>[test] Account 1 address = {this.context.account.toString()} </h3>
                    <form onSubmit={this.contactSubmit.bind(this)} className="form">
                        <br></br>
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
                        <label htmlFor="Reg-Time">Registration phase start &emsp;</label>
                        <input id="date_Reg_Start" type="date" onChange={this.handleChange.bind(this, "date_Reg_start")}
                               value={this.state.fields["date_Reg_start"]}/>

                        <input id="time_Reg_Start" type="time" onChange={this.handleChange.bind(this, "Time_Reg_start")}
                               value={this.state.fields["Time_Reg_start"]}/>
                        <span style={{color: "red"}}>{this.state.errors["date_Reg_start"]}</span>
                        <span style={{color: "red"}}>{this.state.errors["Time_Reg_start"]}</span>

                        <label htmlFor="Reg-Time">&emsp;Registration phase end&emsp;</label>
                        <input id="date_Reg_End" type="date" onChange={this.handleChange.bind(this, "date_Reg_end")}
                               value={this.state.fields["date_Reg_end"]}/>
                        <input id="time_Reg_End" type="time" onChange={this.handleChange.bind(this, "Time_Reg_end")}
                               value={this.state.fields["Time_Reg_end"]}/>
                        <span style={{color: "red"}}>{this.state.errors["date_Reg_end"]}</span>
                        <span style={{color: "red"}}>{this.state.errors["Time_Reg_end"]}</span>

                        <label htmlFor="Reg-Time" style={{color: '#db1818'}}>&emsp; <mark><b>Voting phase will start automatically
                            after registration ends </b></mark> </label>
                        <br/><br/>
                        <label htmlFor="Reg-Time">Voting phase end &emsp;</label>
                        <input id="date_Vote_End" type="date" onChange={this.handleChange.bind(this, "date_vote_end")}
                               value={this.state.fields["date_vote_end"]}/>
                        <input id="time_Vote_End" type="time" onChange={this.handleChange.bind(this, "Time_vote_end")}
                               value={this.state.fields["Time_vote_end"]}/>
                        <span style={{color: "red"}}>{this.state.errors["date_vote_end"]}</span>
                        <span style={{color: "red"}}>{this.state.errors["Time_vote_end"]}</span>

                        <label htmlFor="Tally" style={{color: '#db1818'}}>&emsp; <mark> <b> Tally phase will start automatically
                            after voting phase is over</b></mark> </label>
                        <br/><br/>

                        <label htmlfor="myfile">Select a text file containing the eligible voter's
                            addresses: &emsp;&emsp; </label>

                        <input type="file" id="myfile" name="myfile" onChange={this.handleChange.bind(this, "txtfile")}
                               value={this.state.fields["txtfile"]}></input>
                        <span style={{color: "red"}}>{this.state.errors["txtfile"]}</span>
                        <br></br>
                        <br></br>
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
export default About;


