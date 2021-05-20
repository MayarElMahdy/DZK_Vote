import React, {Component} from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {CreateBallot, Home, Navigation, Vote} from "./components";
import {loadWeb3, Web3Context} from "./web3-context";

// initialize the global context

class App extends Component {

    state = {web3: null};

    componentWillMount = async () => {
        const loadedWeb3 = await loadWeb3();
        // the global context that will provide the web3 instances for the whole app
        this.setState({web3: loadedWeb3});
    }

    render() {
        if (!this.state.web3) {
            return <h2>Loading Web3, accounts, and contract...</h2>;
        }
        return (
            <div className="App">
                <Web3Context.Provider value={this.state.web3}>
                    <Router>
                        <Navigation/>
                        <Switch>
                            <Route path="/" exact component={() => <Home/>}/>
                            <Route path="/CreateBallot" exact component={() => <CreateBallot/>}/>
                            <Route path="/vote" exact component={() => <Vote/>}/>
                        </Switch>
                    </Router>
                </Web3Context.Provider>

            </div>
        );
    }


}

export default App;