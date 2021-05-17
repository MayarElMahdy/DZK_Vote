pragma solidity >=0.4.21 <0.7.0;

//admin (deploy, ballot name, candidates,start and fenish time, allowed addresses)
//user (check address, compute dzk, cast vote, view results)

contract owned {
    address public owner;
    function owned() {
        owner = msg.sender;
    }
    modifier onlyOwner {
        if(owner != msg.sender) throw;
        _;
    }
    function transferOwnership(address newOwner) onlyOwner() {
        owner = newOwner;
    }
}

contract VotingSys is owned{

  struct Voter {
      address addr;
      uint[2] key;
      uint[2] vote;
  }

  address[] public addresses;
  mapping (address => uint) public addressid; // Address to Counter
  mapping (uint => Voter) public voters;
  mapping (address => bool) public eligible; // White list of addresses allowed to vote
  mapping (address => bool) public registered; // Address registered?
  mapping (address => bool) public votecast; // Address voted?

  uint public startRegistrationPhase;
  uint public endRegistrationPhase;
  uint public endVotingPhase;
  uint public totalRegistered; //Total number of participants that have submited a voting key
  uint public totalEligible;
  uint public totalVoted;
  string public ballotName; //Ballot Name
  string[2] public candidates;
  uint[2] public finaltally; // Final tally
  
  enum State { CREATE, REGISTER, VOTE, FINISH }
  State public state;

  modifier inState(State s) {
    if(state != s) {
        throw;
    }
    _;
  }

  function AnonymousVoting() {
    state = State.CREATE;
  }
  function setEligible(address[] addr) inState(State.CREATE) onlyOwner{
    //el file hyet3mallo read abl ma yetb3tly
    //as an array??
    for(uint i=0; i<addr.length; i++) {
      eligible[addr[i]] = true;
        addresses.push(addr[i]);
        totalEligible += 1;
    }
  }

  function creatBallot(string _ballotName, string candidateA, string candidateB, uint _startRegistrationPhase, uint _endRegistrationPhase, uint _endVotingPhase, uint _depositrequired) inState(State.CREATE) onlyOwner payable returns (bool){
  if(_startRegistrationPhase > 0 && addresses.length >= 3){
    if(_endRegistrationPhase < _startRegistrationPhase){
      return false;
      }
    if(_endVotingPhase < _endRegistrationPhase){
      return false;
      }
    ballotName = ballotName;
    candidates[0] = candidateA;
    candidates[1] = candidateB;
    startRegistrationPhase = _startRegistrationPhase;
    endRegistrationPhase = _endRegistrationPhase;
    endVotingPhase = _endVotingPhase;
    
    }
  else{
    return false;
    }
  }

  function deadlinePassed() returns (bool){

    uint[2] memory empty;
    if(block.timestamp > startRegistrationPhase){
      state = State.REGISTER;
    }
    if(block.timestamp > endRegistrationPhase){
      state = State.VOTE;
    }
    if(block.timestamp > endVotingPhase){
      state = State.FINISH;
    }
    if(state == State.FINISH) {
       for(uint i=0; i<addresses.length; i++) {
          address addr = addresses[i];
          eligible[addr] = false; // No longer eligible
          registered[addr] = false; // Remove voting registration
          voters[i] = Voter({addr: 0, key: empty, vote: empty});
          addressid[addr] = 0; // Remove index
          votecast[addr] = false; // Remove that vote was cast
         }

         // Reset timers.
         startRegistrationPhase = 0;
         endRegistrationPhase = 0;
         endVotingPhase = 0;
         delete addresses;

         // Keep track of voter activity
         totalRegistered = 0;
         totalEligible = 0;
         totalVoted = 0;

         // General values that need reset
         ballotName = "";
         candidates[0] = "";
         candidates[1] = "";
         finaltally[0] = 0;
         finaltally[1] = 0;
         state = State.CREATE;
         return true;
      }
      return false;
  }
  function register(uint[2] _key) inState(State.REGISTER) returns (bool) {
    // Only eligible addresses can vote
    if(eligible[msg.sender]) {
        if(!registered[msg.sender]) {

            // Update voter's registration
            uint[2] memory empty;
            addressid[msg.sender] = totalRegistered;
            voters[totalRegistered] = Voter({addr: msg.sender, key: _key, vote: empty});
            registered[msg.sender] = true;
            totalRegistered += 1;

            return true;
        }
    }

    return false;
  }
  function submitVote(uint[2] choice) inState(State.VOTE) returns (bool) {
     if(block.timestamp > endVotingPhase) {
       return;
     }

     uint c = addressid[msg.sender];

     // Make sure the sender can vote, and hasn't already voted.
     if(registered[msg.sender] && !votecast[msg.sender]) {
       voters[c].vote = choice;
       votecast[msg.sender] = true;
       totalVoted += 1;
     }

     return false;
  }
}