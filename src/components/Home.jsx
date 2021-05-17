import React from "react";
import { Link } from "react-router-dom";


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
              <img src="./create-ballot.png"></img>
               <h1 className="text-center">Create-ballot</h1>
            </Link>
          </div>

          <div class="col-sm icons">
            <Link to="/Vote">
              <img src="./question-main.png"></img>
              <h1 className="text-center">Vote</h1>
            </Link>
          </div>

        </div>
      </div>

    </div> 

  );
}

export default Home;
