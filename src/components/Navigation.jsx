import React, {Component} from "react";
import { Link, withRouter } from "react-router-dom";
import { Web3Context } from "../web3-context";

class Navigation extends Component {

  static contextType = Web3Context;

  constructor(props) {
    super(props)
    this.state = {
      account: ''
      , fields: {}
      , errors: {}
      , ballot: true
      , ballot_confirm: false

    }
  }

  render() {
    const { ballot, ballot_confirm } = this.state;
    return (
      <div className="navigation">
        <nav className="navbar navbar-expand-md navbar-dark">
          <Link className="navbar-brand nav-logo" to="/">
            DZK
        </Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse"
            data-target="#navbarSupportedContent">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="container">
            <div className="collapse navbar-collapse ml-auto" id="navbarSupportedContent">
              <ul className="navbar-nav ml-auto mb-1 mb-lg-0">
                <li
                  className={`nav-item  ${this.props.location.pathname === "/" ? "active" : ""
                    }`}
                >
                  <Link className="nav-link nav-links-right" to="/">
                    Home
                  <span className="sr-only">(current)</span>
                  </Link>
                </li>
                <li
                  className={`nav-item  ${this.props.location.pathname === "/CreateBallot" ? "active" : ""
                    }`}
                >
                  <Link className="nav-link nav-links-right" to="/CreateBallot">
                    Create Ballot
                </Link>
                </li>
                <li
                  className={`nav-item  ${this.props.location.pathname === "/vote" ? "active" : ""
                    }`}
                >
                  <Link className="nav-link nav-links-right" to="/vote">
                    Vote
                </Link>
                </li>

                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle nav-links-right" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Account
                  </a>
                  <ul className="dropdown-menu dropdown-menu-right text-center" aria-labelledby="navbarDropdownMenuLink">
                    <br></br>
                    <p className="address-dropdown">
                      <h5>Account Address</h5>
                      <h6 className="mb-4">{this.context.account.toString()}</h6>
                    </p>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}
export default withRouter(Navigation);