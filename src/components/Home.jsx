import React from "react";
import { Link } from "react-router-dom";

import Logo from "./images/create-ballot2.png";
import Vote from "./images/vote.png"
import banner from "./images/4448.jpg"
import red from "./images/icon red.png"
import green from "./images/icon green.png"
import blue from "./images/icon blue.png"


function Home() {
  return (
    <div>
      <div className="container-fluid row">
        <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 float-right order-last order-md-first order-sm-last">
          <div className="container">

            <h2 className="words title">DZK E-Voting System</h2><br></br>
            <div className="row">
              <img className="blue-icon" src={blue} alt=""></img>
              <h3 className="words">Decentralized</h3>
            </div>


            <div className="row">
              <img className="red-icon" src={red} alt=""></img>
              <h3 className="words">Secure</h3>
            </div>

            <div className="row">
              <img className="green-icon" src={green} alt=""></img>
              <h3 className="words">Trustworthy</h3>
            </div>

          </div>
        </div>
        <img className="rouned float-right col-xl-8 col-lg-8 col-md-8 col-sm-12 order-first order-md-last order-sm-first" src={banner} alt=""></img>
      </div>

      <div className="row justify-content-md-center text-center">
        <div className="col col-lg-2 options options-left icons">
          <Link to="/CreateBallot">
            <img className="img-fluid" src={Logo} alt=""></img><br></br>
            <h4 className="text-center">Create-ballot</h4>
          </Link>
        </div>
        <div class="col col-lg-2 options options-right icons">
          <Link to="/Vote">
            <img src={Vote} alt=""></img><br></br>
            <h4 className="text-center">Vote</h4>
          </Link>
        </div>
      </div>

    </div>
  );
}

export default Home;