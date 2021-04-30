import React from "react";
import Web3 from 'web3';
import { Link, withRouter } from "react-router-dom";

class About extends React.Component{
  
      //we want to talk to the blockchain by using WEB3
      //Metamask is a wallet , in order to connect to the blockchain & wallet you need WEB3 
      async componentWillMount() {
        //start these functions when component is made
       // await this.connect_web3()
        //then fetch the ethereum account from metamask 
       // await this.fetch_account()
        
    
      }
    
      async connect_web3()
      {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.enable()
        }
        else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
          window.alert('Non-Ethereum browser detected. You should download Metamask')
        }
      }
    
      async fetch_account()
      {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        console.log(accounts) 
        this.setState({account : accounts[0]})
      }

      handle_output()
      {
        var title = document.getElementById("Contract-name").value 
        var can1 = document.getElementById("Cand-1").value
        var can2 = document.getElementById("Cand-2").value
        var time1 = document.getElementById("time_Reg_Start").value
        var date1 = document.getElementById("date_Reg_Start").value
        var time2 = document.getElementById("time_Reg_End").value
        var date2 = document.getElementById("date_Reg_End").value
        var time3 = document.getElementById("time_Vote_End").value
        var date3 = document.getElementById("date_Vote_End").value
        console.log("I AM HERE")
        if(title && can1 && can2 && time1 && time2 && time3 && date1 && date2 && date3)
        {
          alert("SUCESSSSSS") 
          
        }
        else
        {
          
          alert("Empty")
        }

      }
    
      constructor(props)
      {
        super(props)
        this.state = {
          account:''
          
        }
      }

  render(){
    
    return (
    <div>
      
        <div className="forms">
          <h3 style={{textAlign: 'center'}}>Please fill out this form to create ballot {this.state.account}</h3>  
          <form >
            <label htmlFor="Contract-name">Ballot Name</label>
            <input type="text" id="Contract-name" name="Ballot Name" placeholder="Enter the name of ballot" />
            <br />
            <label htmlFor="Candidate-Name"> Write your options </label>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <input type="text" id="Cand-1" name="Cand-1" placeholder="Enter the first option" />
              <input type="text" id="Cand-2" name="Cand-2" placeholder="Enter the second option" />
            </div>
            <br />
            <label htmlFor="TimeStamps">Enter the timestamp of each phase : <br /> </label>
            <br /><br />
            <label htmlFor="Reg-Time">Registration phase start</label> 
            <input id="date_Reg_Start" type="date" />
            <input id="time_Reg_Start" type="time" />
            <br /><br />
            <label htmlFor="Reg-Time">Registration phase end</label>
            <input id="date_Reg_End" type="date" />
            <input id="time_Reg_End" type="time" />
            <br /><br />
            <label htmlFor="Reg-Time" style={{color: '#db1818'}}>Voting phase will start automatically after registration ends</label>
            <br /><br />
            <label htmlFor="Reg-Time">Voting phase end</label>
            <input id="date_Vote_End" type="date" />
            <input id="time_Vote_End" type="time" />
            <br /> <br />
            <label htmlFor="Tally" style={{color: '#db1818'}}>Tally phase will start automatically after voting phase is over </label>
            <br /><br />
            
            <label htmlfor="myfile">Select a text file containing the eligible voter's addresses: </label>
            <br></br>
            <input type="file" id="myfile" name="myfile"></input>
            
            <Link to="/" type="submit" className="Button" onClick={this.handle_output.bind()}>Create Ballot</Link>
            
            
          </form>
        </div>
        <div className="question-main" /> 
      </div>
      
    
    );
  }
}

export default About;


