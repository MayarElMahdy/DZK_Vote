import React, {Component} from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {About, Vote, Footer, Home, Navigation} from "./components";
import {Web3Context, loadWeb3} from "./web3-context";

// initialize the global context

class App extends Component {

    state = {web3: null};

    componentDidMount = async () => {
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
                            <Route path="/about" exact component={() => <About/>}/>
                            <Route path="/vote" exact component={() => <Vote/>}/>
                        </Switch>
                        <Footer/>
                    </Router>
                </Web3Context.Provider>

            </div>
        );
    }


}

export default App;