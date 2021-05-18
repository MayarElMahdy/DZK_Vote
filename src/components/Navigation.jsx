import React from "react";
import { Link, withRouter } from "react-router-dom";
import account from "./images/account.png"

function Navigation(props) {
  return (
    <div className="navigation">
      <nav class="navbar navbar-expand-md navbar-dark">
        <Link class="navbar-brand nav-logo" to="/">
          DZK
        </Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse"
          data-target="#navbarSupportedContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div class="container">
          <div className="collapse navbar-collapse ml-auto" id="navbarSupportedContent">
            <ul class="navbar-nav ml-auto mb-2 mb-lg-0">
              <li
                class={`nav-item  ${props.location.pathname === "/" ? "active" : ""
                  }`}
              >
                <Link class="nav-link nav-links-right" to="/">
                  Home
                  <span class="sr-only">(current)</span>
                </Link>
              </li>
              <li
                class={`nav-item  ${props.location.pathname === "/about" ? "active" : ""
                  }`}
              >
                <Link class="nav-link nav-links-right" to="/about">
                  Create Ballot
                </Link>
              </li>
              <li
                class={`nav-item  ${props.location.pathname === "/vote" ? "active" : ""
                  }`}
              >
                <Link class="nav-link nav-links-right" to="/vote">
                  Vote
                </Link>
              </li>

              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle nav-links-right" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <img className="account" src={account}></img>
                </a>
                <ul class="dropdown-menu text-center" aria-labelledby="navbarDropdownMenuLink">
                  <br></br>
                  <a class="dropdown-item">Address : 0x6D3Cd080cf2648144</a>
                  <div class="dropdown-divider"></div>
                  <li><a class="dropdown-item" href="#">Sign out</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default withRouter(Navigation);