import React from "react";
import { Link } from "react-router-dom";
import Logo from "./create-ballot.png";
import Vote from "./voting.png"

function Home() {
  return (
    <div>
      <div className="welcome">
        <br></br>
         <h1>Welcome 0x2654k....</h1>
         <br></br>
         <button type="button" class="btn btn-secondary btn-lg">Change account ?</button>
      </div>

      <div class="container-fluid text-center">
        <div class="row">
          
          <div class="col-sm icons">
          <Link to="/about">
              <img src={Logo}></img>
               <h1 className="text-center">Create-ballot</h1>
            </Link>
          </div>

          <div class="col-sm icons">
            <Link to="/Vote">
              <img src={Vote}></img>
              <h1 className="text-center">Vote</h1>
            </Link>
          </div>

        </div>
      </div>

    </div> 

  );
}

export default Home;