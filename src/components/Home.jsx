import React from "react";
import { Link } from "react-router-dom";

import Create from "./images/ballot(2).png";
import Edit from "./images/ballot(3).png";
import Vote from "./images/votee.png"
import Tally from "./images/Tally.png"
import banner from "./images/4448.jpg"
import bluebg from "./images/mobile.png"
import { left } from "@popperjs/core";
import { width } from "@material-ui/system";


function Home() {
  return (
    <div>

      <div id="bluebg" className="banner-wrapper">
        <img className="banner-image" src={bluebg} alt=""></img>
        <div className="absolute-wrapper">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h1 className="overlay-text">DZK-VS</h1>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <h3 id="tablet" className="overlay-text">Decentralized</h3>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <h4 id="tablet" className="overlay-text">Based on Blockchain technology</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <h3 id="tablet" className="overlay-text">Secure</h3>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <h4 id="tablet" className="overlay-text">Utilizes zero-knowledge technology</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <h3 id="tablet" className="overlay-text">Trustworthy</h3>
              </div>
            </div>
            <div className="row">
              <div style={{ marginBottom: "5%" }} className="col-12">
                <h4 id="tablet" className="overlay-text">Based on something something something</h4>
              </div>
            </div>

            <Link to="/CreateBallot" style={{ textDecoration: 'none' }}>
              <div style={{ padding: "15px" }} className="row">
                <div className="d-flex align-items-center select col-12">
                  <img className="float-left select-img" src={Create} alt=""></img>
                  <h4 className="select-font center" style={{ fontSize: "6.5vw" }}>Create ballot</h4>
                </div>
              </div>
            </Link>


            <Link to="/EditBallot" style={{ textDecoration: 'none' }}>
              <div style={{ padding: "15px" }} className="row">
                <div className="d-flex align-items-center select col-12">
                  <img className="float-left select-img" src={Edit} alt=""></img>
                  <h4 className="select-font center" style={{ fontSize: "6.5vw" }}>Edit Ballot</h4>
                </div>
              </div>
            </Link>


            <Link to="/Vote" style={{ textDecoration: 'none' }}>
              <div style={{ padding: "15px" }} className="row">
                <div className="d-flex align-items-center select col-12">
                  <img className="float-left select-img" src={Vote} alt=""></img>
                  <h4 className="select-font center" style={{ fontSize: "6.5vw" }}>Vote</h4>
                </div>
              </div>
            </Link>


            <Link to="/Tally" style={{ textDecoration: 'none' }}>
              <div style={{ padding: "15px" }} className="row">
                <div style={{ marginBottom: '40px' }} className="d-flex align-items-center select col-12">
                  <img className="float-left select-img" src={Tally} alt=""></img>
                  <h4 className="select-font center" style={{ fontSize: "6.5vw" }}>Tally</h4>
                </div>
              </div>
            </Link>


          </div>
        </div>
      </div>

      <div id="homepage">
        <div className="container-fluid row">
          <div className="col-4 float-left">
            <div className="container">
              <h1 id="maintitle" className="text-center words">DZK-VS</h1><br></br>

              <div className="row ml-3">
                <h3 style={{ color: "#F47169" }} className="words">Decentralized</h3>
              </div>

              <div className="row ml-3">
                <h4 className="words">Based on blockchain technology</h4>
              </div>

              <div className="row ml-3">
                <h3 style={{ color: "#64ACC2" }} id="subtitle" className="words">Secure</h3>
              </div>

              <div className="row ml-3">
                <h4 className="words">Utilizes zero knowledge technology</h4>
              </div>

              <div className="row ml-3">
                <h3 style={{ color: "#9DD49A" }} className="words">Trustworthy</h3>
              </div>

              <div className="row ml-3">
                <h4 className="words">Based on something something</h4>
              </div>
            </div>
          </div>
          <img className="rounded float-right col-8" src={banner} alt=""></img>
        </div>

        <div className="p-3 mb-5 d-flex flex-row justify-content-around">
          <Link to="/CreateBallot" style={{ textDecoration: 'none' }}>
            <div style={{ textAlign: "center" }} className="m-2 p-3 icons">
              <img className="m-2" src={Create} alt=""></img>
              <h4 className="text-center">Create ballot</h4>
            </div>
          </Link>

          <Link to="/EditBallot" style={{ textDecoration: 'none' }}>
            <div style={{ textAlign: "center" }} className="m-2 p-3 icons">
              <img className="m-2" src={Edit} alt=""></img>
              <h4 className="text-center">Edit Ballot</h4>
            </div>
          </Link>

          <Link to="/Vote" style={{ textDecoration: 'none' }}>
            <div style={{ textAlign: "center" }} className="m-2 p-3 icons">
              <img className="m-2" src={Vote} alt=""></img>
              <h4 className="text-center">Vote</h4>
            </div>
          </Link>


          <Link to="/Tally" style={{ textDecoration: 'none' }}>
            <div style={{ textAlign: "center" }} className="m-2 p-3 icons">
              <img className="m-2" src={Tally} alt=""></img>
              <h4 className="text-center">Tally</h4>
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}

export default Home;