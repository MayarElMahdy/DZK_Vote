import React, {Component} from "react";
import {Chart} from "react-google-charts";
import {Web3Context} from "../web3-context";

class Tally extends Component {

    static contextType = Web3Context;
    result1 = ['zahraa', 536];
    result2 = ['zahraa', 245];

    constructor(props, r1, r2) {
        super(props);
        /*
        this.result1 = r1;
        this.result2 = r2;*/

    }


    render() {
        return (
            <div className="container-fluid column">

                <div className="text-center mt-5">
                    <h1>Vote Result</h1>
                </div>
                <div className="d-flex flex-row justify-content-center">
                    <div>
                        <Chart
                            width={'700px'}
                            height={'500px'}
                            chartType="PieChart"
                            loader={<div>Loading Chart</div>}
                            data={[
                                ['Candidate', 'No_of_votes'],
                                this.result1,
                                this.result2
                            ]}
                            options={{
                                is3D: true,
                            }}
                            rootProps={{'data-testid': '2'}}
                        />
                    </div>
                    <div>
                        <Chart
                            width={'600px'}
                            height={'400px'}
                            chartType="Bar"
                            loader={<div>Loading Chart</div>}
                            data={[
                                ['Candidate', 'Number of votes'],
                                this.result1,
                                this.result2
                            ]}
                            // For tests
                            rootProps={{'data-testid': '2'}}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Tally;