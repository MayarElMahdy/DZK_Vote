import React, {Component} from "react";
import { render } from 'react-dom';
import {Link} from "react-router-dom";
import {Web3Context} from "../web3-context";
import CreateBallotBL from "../businessLayer/CreateBallotBL";
import ReactFileReader from 'react-file-reader';

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
            , value: "" // Used to show the ballot's confirmation
            
        }
        this.fileInput = React.createRef();

        this.BL.getBallotStatement().then(returnValue => {
            this.setState({value: returnValue});})
        
            
        

    }


    contactSubmit(e) {
        e.preventDefault();

        if (this.handleValidation()) {
            
            //turn date,time to unix timestamp 
            var start_date =  this.state.fields["date_Reg_start"] + "T" + this.state.fields["Time_Reg_start"];
            var end_date = this.state.fields["date_Reg_end"] + "T" + this.state.fields["Time_Reg_end"];
            var unix_start_date =  parseInt((new Date(start_date).getTime() / 1000).toFixed(0));
            var unix_end_date =  parseInt((new Date(end_date).getTime() / 1000).toFixed(0));
            //call business layer to create ballot 
            //todo: read file  , there is a problem when reading the file it gives "fakepath"
           
            
            
            this.BL.creatBallot(this.context.account[0],
                this.state.fields["BallotName"],
                this.state.fields["Cand1"],
                this.state.fields["Cand2"],
                unix_start_date,
                unix_end_date,
                5435,
                ["0xca36158f9a6e43F5564803F2172bB8f1907f6D74",
                "0x5EE383FefbB9f05970746720ab19b2B3b52c3935",
                "0x2263d2b73859265216683afA86c1481c1F615f4B"]).then(response => {
                      console.log(response);
                      this.BL.getBallotStatement().then(returnValue => {
                      this.setState({value: returnValue});
                       })
                    })
            this.setState({ballot: false});
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
        if(!formIsValid) //if empty fields , then dont continue the validation of txt file 
        {
        this.setState({errors: errors});
        return formIsValid;
        }
        
        //check if the uploaded file is txt file 
        //var reader = new FileReader();
        var textfile = /text.*/;
        
        var file = document.querySelector('input[type=file]').files[0];
        
        if(!file.type.match(textfile))
        {
            formIsValid = false;
            errors["txtfile"] = "The selected file is not text file !";
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

                {this.state.ballot &&  // show when ballot = true
                <div>
                    
                    
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
                               value={this.state.fields["txtfile"]} ref={this.fileInput}/>
                        <span style={{color: "red"}}>{this.state.errors["txtfile"]}</span>
                        <br/>
                        <br/>
                        <input type="submit"/>
                        <Link to="/" type="submit" className="Button">Create Ballot</Link>
                    </form>

                </div>
                }

                {this.state.ballot_confirm && // when creation is complete
                <div>
                <h3 style={{margin: 60}}>Ballot has been created and it's statement is = {this.state.value} </h3>
                
                

                </div>

                }


            </div>


        );
    }
}

export default CreateBallot;