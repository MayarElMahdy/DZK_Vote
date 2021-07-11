import React, { Component } from "react";
import { Chart } from "react-google-charts";

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

    result1 = ['zahraa', 536];
    result2 = ['zahraa', 245];

    state = {
        chartImageURI: ""
    };

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
                <div className="d-flex flex-sm-column flex-row justify-content-center">
                    <div className="order-1">
                        <Chart
                            width={'auto'}
                            height={'500px'}
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