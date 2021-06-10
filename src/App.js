import React, {Component} from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {CreateBallot, Home, Navigation, Vote, Tally} from "./components";
import {loadWeb3, Web3Context} from "./web3-context";
import banner from "./components/images/4448.jpg"


export const PHASE = Object.freeze({"CREATE": 0, "REGISTER": 1, "VOTE": 2, "FINISH": 3})

class App extends Component {

    state = {web3: null};

    componentWillMount = async () => {
        const loadedWeb3 = await loadWeb3();
        // the global context that will provide the web3 instances for the whole app
        this.setState({web3: loadedWeb3});
    }

    render() {
        if (!this.state.web3) {
            return (
                <div>
                    <div className="container text-center">
                        <img className="rounded mx-auto d-block img-fluid question-main" src={banner} alt=""></img>
                    </div>
                    <div className="p-5 text-center loading-banner"><h1 style={{ color: 'white' }}>Connecting ...</h1></div>
                </div>
            );
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
                            <Route path="/Tally" exact component={() => <Tally/>}/>
                        </Switch>
                    </Router>
                </Web3Context.Provider>

            </div>
        );
    }


}

export default App;