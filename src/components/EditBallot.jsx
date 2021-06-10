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

        if(!txtfile){
            errorsTxtfile = "Please attach a text file !";
            formIsValid=false;
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
            this.BL.addEligible(this.context.account[0],eligible).then(response=> alert(response));
            

        }.bind(this)
        reader.readAsText(file);
        this.setState({errorsTxtfile: errorsTxtfile});
        
        return formIsValid
    }


    render(){
        
        
        return(
        <div>
        {this.state.value &&
           <div>
               <h3 style={{margin: 60}}>Your current ballot statement is {this.state.value}</h3>
               <form onSubmit={this.contactSubmit.bind(this)}  style={{margin: 100 }}  className="form">
                    <br></br>
                    <label htmlFor="myfile">Select a text file containing the addresses of elligible voter  you want to add :  &emsp;&emsp; </label>

                    <input type="file" id="myfile" name="myfile" onChange={this.handleChange.bind(this, "txtfile")}
                        value={this.state.txtfile} ref={this.fileInput}/>
                    <span style={{color: "red"}}>{this.state.errorsTxtfile}</span>
                    
                    <br></br> <br></br>
                    <input type="submit" value="Add Voters"/>
                </form>
           </div> 
           
        }
        {!this.state.value &&
            <div>
                <h4 style={{margin: 100 }}  >No Ballot was Created .. </h4>
            </div>

        }
            </div>

        );
    }
}

export default EditBallot;