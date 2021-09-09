import React, {Component} from "react";
import {Chart} from "react-google-charts";
import VotingBL from "../businessLayer/VotingBL";
import {Web3Context} from "../web3-context";

const pieOptions = {
    title: "",
    pieHole: 0.6,
    is3D: true,
    slices: [
        {
            color: "#2BB673"
        },
        {
            color: "#d91e48"
        }
    ],
    legend: {
        position: "bottom",
        alignment: "center",
        textStyle: {
            color: "233238",
            fontSize: 15
        }
    },
    tooltip: {
        showColorCode: true
    },
    chartArea: {
        top: 0,
        width: "100%",
        height: "80%"
    },
    fontName: "Roboto"
};

class Tally extends Component {

    static contextType = Web3Context;
    BL = new VotingBL();

    constructor(props) {
        super(props);

        this.state = {
            chartImageURI: "",
            name1: this.BL.getCand1(),
            name2: this.BL.getCand2(),
            result1:null,
            result2:null
        };

    }
    
    componentDidMount = async () => {
        //const proof = await this.BL.generate1outOf2Proof(this.context.account[0], 1);
        // console.log(await this.BL.submitVote(this.context.account[0], 1, proof));
        
        // use this 3ady
        const result = await this.BL.getTalliedResult(this.context.account[0]);
        const cand1 = await this.BL.getCand1();
        const cand2 = await this.BL.getCand2();
        this.setState({ name1: cand1, name2: cand2});
        this.setState({ result1: parseInt(result.votedNo), result2: parseInt(result.votedYes) });        
    };


    render() {
        console.log("candidate 1: " + this.state.name1);
        console.log("candidate 2: " + this.state.name2);
        console.log("candidate 1 result: " + this.state.result1);
        console.log("candidate 2 result: " + this.state.result2);
        return (
            <div className="container-fluid column">
                
                <div className="text-center mt-5 row">
                    <h3>Vote Result</h3>
                </div>
                <div className="d-flex flex-sm-column flex-row justify-content-center">
                    <div className="order-1">
                        <Chart
                            width={'auto'}
                            height={'35vw'}
                            chartType="PieChart"
                            loader={<div>Loading Chart</div>}
                            data={[
                                ['Candidate', 'No_of_votes'],
                                [this.state.name1, this.state.result1],
                                [this.state.name2, this.state.result2]
                            ]}
                            options={pieOptions}
                            legend_toggle
                            rootProps={{ 'data-testid': '2' }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}


export default Tally;