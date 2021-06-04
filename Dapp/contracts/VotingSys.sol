pragma solidity >=0.4.21 <0.7.0;

import "./Owned.sol";
import "./libraries/Secp256k1_noconflict.sol";

contract VotingSys is Owned {

    struct Voter {
        address addr;
        uint[2] key;
        uint[2] vote;
    }

    address[] public addresses;
    mapping(address => uint) public addressid; // Address to Counter
    mapping(uint => Voter) public voters;
    mapping(address => bool) public eligible; // White list of addresses allowed to vote
    mapping(address => bool) public registered; // Address registered?
    mapping(address => bool) public votecast; // Address voted?
    mapping (address => uint) public refunds; //amount to be refunded

    uint public endRegistrationPhase;
    uint public endVotingPhase;
    uint public totalRegistered; // Total number of participants that have submitted a voting key
    uint public totalEligible;
    uint public totalVoted;
    string public ballotName; // Ballot Name
    string[2] public options;
    uint[2] public finalTally; // Final tally

    enum State {CREATE, REGISTER, VOTE, FINISH}
    State public currentState;

    uint public minDeposit;

    modifier inState(State s) {
        if (currentState != s) {
            throw;
        }
        _;
    }

    function VotingSys() {
        currentState = State.CREATE;
    }

    //  must be more that 3 voters in the beginning (called by create ballot only)
    function setInitialEligible(address[] addr) private inState(State.CREATE) onlyOwner returns (bool){
        if (addr.length >= 3) {
            for (uint i = 0; i < addr.length; i++) {
                if (!eligible[addr[i]]) { // can't be too careful
                    eligible[addr[i]] = true;
                    addresses.push(addr[i]);
                    totalEligible += 1;
                }
            }
            return true;
        } else {
            return false;
        }
    }

    function creatBallot(
        string _ballotStatement,
        string option1,
        string option2,
        uint _endRegistrationPhase,
        uint _endVotingPhase,
        uint _depositRequired,
        address[] addr
    )
    inState(State.CREATE)
    onlyOwner
    returns (bool){
        if (_endRegistrationPhase < now) {
            return false;
        }
        if (_endVotingPhase < _endRegistrationPhase) {
            return false;
        }
        if (!setInitialEligible(addr)) {
            return false;
        }
        ballotName = _ballotStatement;
        options[0] = option1;
        options[1] = option2;
        endRegistrationPhase = _endRegistrationPhase;
        endVotingPhase = _endVotingPhase;
        minDeposit = _depositRequired;
        currentState = State.REGISTER;
        return true;
    }

    //  inState(State.REGISTER) to allow the admin to add more eligible users in the reg phase
    //  should be after creation of ballot
    function addEligible(address[] addr) inState(State.REGISTER) onlyOwner {
        for (uint i = 0; i < addr.length; i++) {
            if (!eligible[addr[i]]) {
                eligible[addr[i]] = true;
                addresses.push(addr[i]);
                totalEligible += 1;
            }
        }
    }

    // called when someone try to:
    // regester
    // vote
    // in order to set to correct state and reset if finished
        function deadlinePassed() returns (bool){
    
            uint[2] memory empty;
            if (now > endRegistrationPhase) {
                currentState = State.VOTE;
            }
            if (now > endVotingPhase) {
                currentState = State.FINISH;
            }
            if (currentState == State.FINISH) {
    //    todo: should be separated in private function called resetBallot()
    //    todo: lost deposits
                for (uint i = 0; i < addresses.length; i++) {
                    address addr = addresses[i];
                    eligible[addr] = false;
                    // No longer eligible
                    registered[addr] = false;
                    // Remove voting registration
                    voters[i] = Voter({addr : 0, key : empty, vote : empty});
                    addressid[addr] = 0;
                    // Remove index
                    votecast[addr] = false;
                    // Remove that vote was cast
                    refunds[addr] = 0;
                    // Remove refunds
                }
    
                // Reset timers.
                endRegistrationPhase = 0;
                endVotingPhase = 0;
                delete addresses;
    
                // Keep track of voter activity
                totalRegistered = 0;
                totalEligible = 0;
                totalVoted = 0;
    
                // General values that need reset
                ballotName = "";
                options[0] = "";
                options[1] = "";
                finalTally[0] = 0;
                finalTally[1] = 0;
                minDeposit = 0;
                currentState = State.CREATE;
                return true;
            }
            return false;
            //false means that current state != FINISH 
        }



    function register(uint[2] _key) inState(State.REGISTER) payable returns (bool) {
        
        if(msg.value != minDeposit) {
           return false;
        }
    // Only eligible addresses can vote
        if (eligible[msg.sender]) {
            if (!registered[msg.sender]) {
                // Update voter's registration
                refunds[msg.sender] = msg.value;
                uint[2] memory empty;
                addressid[msg.sender] = totalRegistered;
                voters[totalRegistered] = Voter({addr : msg.sender, key : _key, vote : empty});
                registered[msg.sender] = true;
                totalRegistered += 1;

                return true;
            }
        }
        return false;
    }

    function submitVote(uint[2] choice) inState(State.VOTE) returns (bool) {
        if (now > endVotingPhase) {
            return;
        }

        uint c = addressid[msg.sender];

        // Make sure the sender can vote, and hasn't already voted.
        if (registered[msg.sender] && !votecast[msg.sender]) {
            voters[c].vote = choice;
            votecast[msg.sender] = true;
            totalVoted += 1;
            uint refund = refunds[msg.sender];
            refunds[msg.sender] = 0;

            if (!msg.sender.send(refund)) {//failed to refund
               refunds[msg.sender] = refund;
            }
            return true;
        }

        return false;
    }
}