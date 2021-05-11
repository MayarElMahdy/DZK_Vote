import React from "react";
import {Web3Context} from "../App";
import About from "./About";


function Home() {
  return (
    <div className="home">
      <div class="container">
        <div class="row align-items-center my-5">
          <div class="col-lg-7">
            <img
              class="img-fluid rounded mb-4 mb-lg-0"
              src="http://placehold.it/900x400"
              alt=""
            />
          </div>
          <div class="col-lg-5">
            <h1 class="font-weight-light">Home</h1>
            <p>
              Welcome to DZK Vote 
            </p>
          </div>
        </div>
      </div>
      
    </div>
    
    
  );
}

Home.contextType = Web3Context;
export default Home;
