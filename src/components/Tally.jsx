import React, { Component } from "react";
import { Chart } from "react-google-charts";
import VotingBL from "../businessLayer/VotingBL";
import { Web3Context } from "../web3-context";

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

    result1 = ['Candidate 1', 536];
    result2 = ['Candidate 2', 245];

    state = {
        chartImageURI: "",
        yes: "",
        no: ""
    };
    BL = new VotingBL();

    constructor(props, r1, r2) {
        super(props);

        /*
        this.result1 = r1;
        this.result2 = r2;*/
    }

    componentDidMount = async () => {
        const proof = await this.BL.generate1outOf2Proof(this.context.account[0], 1);
        // console.log(await this.BL.submitVote(this.context.account[0], 1, proof));

        // use this once, el mra el tnya htedrb
        await this.BL.tally(this.context.account[0]);

        // use this 3ady
        const result = await this.BL.getTalliedResult(this.context.account[0]);
        this.setState({ yes: result.votedYes, no: result.votedNo });
    };

    // msh 3arf a3ml el button XD
    tally = async (e) => {
        e.preventDefault();

    };


    render() {
        return (
            <div className="container-fluid column">
                <div className="text-center mt-5 row">
                    <h6>{'tally: ' + this.state.yes + " yes and " + this.state.no + " no"}</h6>
                    <input className="btn submit-button btn-lg ml-5" type="submit" value="show result" />
                    <h1>Vote Result</h1>
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
                                this.result1,
                                this.result2
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