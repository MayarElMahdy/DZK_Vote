pragma solidity >=0.4.21 <0.7.0;

import "./Owned.sol";
import "./libraries/Secp256k1.sol";

contract VotingSys is Owned {

    struct Voter {
        address addr;
        uint[2] registeredKey;
        uint[2] reconstructedKey;
        uint[2] vote;
    }

    address[] public addresses;
    mapping(address => uint) public addressID; // Address to Counter
    mapping(uint => Voter) public voters;
    mapping(address => bool) public eligible; // White list of addresses allowed to vote
    mapping(address => bool) public registered; // Address registered?
    mapping(address => bool) public votecast; // Address voted?
    mapping(address => uint) public refunds; //amount to be refunded

    uint public endRegistrationPhase;
    uint public endVotingPhase;
    uint public totalRegistered; // Total number of participants that have submitted a voting key
    uint public totalEligible;
    uint public totalVoted;
    string public ballotName; // Ballot Name
    string[2] public options;
    uint[2] public finalTally; // Final tally
    uint[2] public prevFinalTally; // Final tally before last reset (not sure will be used)

    enum State {CREATE, REGISTER, VOTE, FINISH}
    State public currentState;

    uint public minDeposit;

    modifier inState(State s) {
        if (currentState != s) {
            revert();
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
                if (!eligible[addr[i]]) {// avoid duplicates
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
                voters[i] = Voter({
                addr : 0,
                registeredKey : empty,
                reconstructedKey : empty,
                vote : empty
                });
                addressID[addr] = 0;
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

            // reset voters activity
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

    function register(uint[2] xG, uint[3] vG, uint r) inState(State.REGISTER) payable returns (bool) {

        if (deadlinePassed()) {
            return false;
        }

        if (currentState != State.REGISTER) {
            return false;
        }

        if (msg.value < minDeposit) {
            return false;
        }
        // Only eligible addresses can vote
        if (eligible[msg.sender]) {
            if (verifyKey(xG, r, vG) && !registered[msg.sender]) {
                // Update voter's registration
                refunds[msg.sender] = msg.value;
                uint[2] memory empty;
                addressID[msg.sender] = totalRegistered;
                voters[totalRegistered] = Voter({
                addr : msg.sender,
                registeredKey : xG,
                reconstructedKey : empty,
                vote : empty
                });
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

        uint c = addressID[msg.sender];

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


    // todo: fix EL SHEEE2 DA!!!!!!!!!!!!!!!!!!!!!!
    //____________________________________________________________________________
    //_________________should be separated in another contract____________________
    //___________________________gives stupid error!!!____________________________
    //____________________________________________________________________________

    // Modulus for public keys
    uint constant pp = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;

    // Base point (generator) G
    uint constant Gx = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798;
    uint constant Gy = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8;

    // New  point (generator) Y
    uint constant Yx = 98038005178408974007512590727651089955354106077095278304532603697039577112780;
    uint constant Yy = 1801119347122147381158502909947365828020117721497557484744596940174906898953;

    // Modulus for private keys (sub-group)
    uint constant nn = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141;

    uint[2] G;
    uint[2] Y;
    // Parameters xG, r where r = v - xc, and vG.
    // Verify that vG = rG + xcG!
    function verifyKey(uint[2] xG, uint r, uint[3] vG) returns (bool){
        uint[2] memory G;
        G[0] = Gx;
        G[1] = Gy;

        // Check both keys are on the curve.
        if (!Secp256k1.isPubKey(xG) || !Secp256k1.isPubKey(vG)) {
            return false;
            //Must be on the curve!
        }

        // Get c = H(g, g^{x}, g^{v});
        bytes32 b_c = sha256(abi.encode(msg.sender, Gx, Gy, xG, vG));
        uint c = uint(b_c);

        // Get g^{r}, and g^{xc}
        uint[3] memory rG = Secp256k1._mul(r, G);
        uint[3] memory xcG = Secp256k1._mul(c, xG);

        // Add both points together
        uint[3] memory rGxcG = Secp256k1._add(rG, xcG);

        // Convert to Affine Co-ordinates
        ECCMath.toZ1(rGxcG, pp);

        // Verify. Do they match?
        if (rGxcG[0] == vG[0] && rGxcG[1] == vG[1]) {
            return true;
        } else {
            return false;
        }
    }
}