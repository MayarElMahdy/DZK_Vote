import React, {Component} from "react";
import {Web3Context} from "../web3-context";
import CreateBallotBL from "../businessLayer/CreateBallotBL";

//This is available only after the admin has created the ballot 
class EditBallot extends Component {
    static contextType = Web3Context;
    // create the businessLayer class
    BL = new CreateBallotBL();
    

    constructor(props) {
        super(props);
        this.state = {
            txtfile:""
            , errorsTxtfile:""
            , value :""
            
        }
        this.BL.getBallotStatement().then(returnValue => {
            this.setState({value: returnValue});
        })
        
        

        this.fileInput = React.createRef();
       
    }

    contactSubmit(e) {
        e.preventDefault();

        if (this.handleValidation()) {

            alert("Sucess")


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

        if(!txtfile){
            errorsTxtfile = "Please attach a text file !";
            formIsValid=false;
        }
        this.setState({errorsTxtfile: errorsTxtfile});
        
        return formIsValid
    }


    render(){
        
        
        return(
        <div>
        {this.state.value &&
           <div>
               <h3>Your Ballot Statement is {this.state.value}</h3>
               <form onSubmit={this.contactSubmit.bind(this)} className="form">

                    <label htmlFor="myfile">Select a text file containing the eligible voter's
                            addresses: &emsp;&emsp; </label>

                    <input type="file" id="myfile" name="myfile" onChange={this.handleChange.bind(this, "txtfile")}
                        value={this.state.txtfile} ref={this.fileInput}/>
                    <span style={{color: "red"}}>{this.state.errorsTxtfile}</span>
                    
                    <br></br>
                    <input type="submit"/>
                </form>
           </div> 
           
        }
        {!this.state.value &&
            <div>
                <h3>No Ballot was Created .. </h3>
            </div>

        }
            </div>

        );
    }
}

export default EditBallot;