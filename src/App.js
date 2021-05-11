import React, {Component} from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {About, Contact, Footer, Home, Navigation} from "./components";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";

// the global (context) that will provide the web3 instances for the whole app
export const Web3Context = React.createContext({web3: null, accounts: null, contract: null});

class App extends Component {

    loadedWeb3Artifacts = {web3: null, accounts: null, contract: null};
    state = {web3: null};
    //we want to talk to the blockchain by using WEB3
    //in order to connect to the blockchain & wallet you need WEB3
    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();

            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = SimpleStorageContract.networks[networkId];
            const instance = new web3.eth.Contract(
                SimpleStorageContract.abi,
                deployedNetwork && deployedNetwork.address,
            );

            // Set web3, accounts, and contract to a variable that will be assigned to the global context.
            this.loadedWeb3Artifacts = {web3: web3, accounts: accounts, contract: instance};
            this.setState({web3: web3});

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };


    render() {
        if (!this.state.web3) {
            return <h2>Loading Web3, accounts, and contract...</h2>;
        }
        return (
            <div className="App">
                <Web3Context.Provider value={this.loadedWeb3Artifacts}>
                    <Router>
                        <Navigation/>
                        <Switch>
                            <Route path="/" exact component={() => <Home/>}/>
                            <Route path="/about" exact component={() => <About/>}/>
                            <Route path="/contact" exact component={() => <Contact/>}/>
                        </Switch>
                        <Footer/>
                    </Router>
                </Web3Context.Provider>

            </div>
        );
    }


}

export default App;