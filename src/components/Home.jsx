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
      <div className="media">
        <div className="media-body title">
          <h2 className="mt-0 mb-1 words">DZK Electronic Voting System</h2><br></br><br></br>
          <div className="row words">
            <img className="blue-icon" src={blue}></img>
            <h1 className="words">Decentralized</h1>
            <br></br>
          </div>

          <div className="row words">
            <img className="red-icon" src={red}></img>
            <h1 className="words">Secure</h1>
            <br></br>
          </div>

          <div className="row words">
            <img className="green-icon" src={green}></img>
            <h1 className="words">Trustworthy</h1>
            <br></br>
          </div>
        </div>
        <img className="banner rouned float-right ml-3" src={banner}></img>
      </div>

      <div className="row justify-content-md-center text-center">
        <div className="col col-lg-2 options options-left icons">
          <Link to="/about">
            <img className="img-fluid" src={Logo}></img><br></br>
            <h4 className="text-center">Create-ballot</h4>
          </Link>
        </div>
       <div class="col col-lg-2 options options-right icons">
          <Link to="/Vote">
            <img src={Vote}></img><br></br>
            <h4 className="text-center">Vote</h4>
         </Link>
       </div>
     </div>
       
    </div> 
  );
}

export default Home;