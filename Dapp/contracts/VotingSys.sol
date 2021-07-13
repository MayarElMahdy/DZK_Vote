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
    mapping(address => bool) public voteCast; // Address voted?
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

    constructor() public {
        currentState = State.CREATE;
    }

    function getVoter() public returns (uint[2] _registeredKey, uint[2] _reconstructedKey) {
        uint index = addressID[msg.sender];
        _registeredKey = voters[index].registeredKey;
        _reconstructedKey = voters[index].reconstructedKey;
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
    public
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
    function addEligible(address[] addr) public inState(State.REGISTER) onlyOwner {
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
    function deadlinePassed() public returns (bool){
        uint[2] memory empty;

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
                voteCast[addr] = false;
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

    function register(uint[2] xG, uint[3] vG, uint r) public inState(State.REGISTER) payable returns (bool) {

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
            if(verifyKey(xG,r,vG)){
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
                voteCast[msg.sender] = false;
                totalRegistered += 1;
                return true;
            }
            
        }
        return false;
    }


    // Timer has expired - we want to start computing the reconstructed keys
    function finishRegistrationPhase() public inState(State.REGISTER) onlyOwner returns (bool) {

        // Make sure at least 3 people have signed up...
        if (totalRegistered < 3) {
            return;
        }
        // We can only compute the public keys once participants
        // have been given an opportunity to register their
        // voting public key.
        //        todo: comment this to bypass time while testing
        //        if (block.timestamp < endRegistrationPhase) {
        //            return false;
        //        }

        uint[2] memory temp;
        uint[3] memory yG;
        uint[3] memory before_i;
        uint[3] memory after_i;

        // Step 1 is to compute the index 1 reconstructed key
        after_i[0] = voters[1].registeredKey[0];
        after_i[1] = voters[1].registeredKey[1];
        after_i[2] = 1;

        for (uint i = 2; i < totalRegistered; i++) {
            Secp256k1._addMixedM(after_i, voters[i].registeredKey);
        }

        ECCMath.toZ1(after_i, pp);
        voters[0].reconstructedKey[0] = after_i[0];
        voters[0].reconstructedKey[1] = pp - after_i[1];

        // Step 2 is to add to before_i, and subtract from after_i.
        for (i = 1; i < totalRegistered; i++) {

            if (i == 1) {
                before_i[0] = voters[0].registeredKey[0];
                before_i[1] = voters[0].registeredKey[1];
                before_i[2] = 1;
            } else {
                Secp256k1._addMixedM(before_i, voters[i - 1].registeredKey);
            }

            // If we have reached the end... just store before_i
            // Otherwise, we need to compute a key.
            // Counting from 0 to n-1...
            if (i == (totalRegistered - 1)) {
                ECCMath.toZ1(before_i, pp);
                voters[i].reconstructedKey[0] = before_i[0];
                voters[i].reconstructedKey[1] = before_i[1];

            } else {

                // Subtract 'i' from after_i
                temp[0] = voters[i].registeredKey[0];
                temp[1] = pp - voters[i].registeredKey[1];

                // Grab negation of after_i (did not seem to work with Jacob co-ordinates)
                Secp256k1._addMixedM(after_i, temp);
                ECCMath.toZ1(after_i, pp);

                temp[0] = after_i[0];
                temp[1] = pp - after_i[1];

                // Now we do before_i - after_i...
                yG = Secp256k1._addMixed(before_i, temp);

                ECCMath.toZ1(yG, pp);

                voters[i].reconstructedKey[0] = yG[0];
                voters[i].reconstructedKey[1] = yG[1];
            }
        }
        currentState = State.VOTE;
        return true;
    }

    // Given the 1 out of 2 ZKP - record the users vote! // todo: add inState(State.VOTE) after development
    function submitVote(uint[4] params, uint[2] y, uint[2] a1, uint[2] b1, uint[2] a2, uint[2] b2) returns (bool) {

        // HARD DEADLINE
        //        todo: commented for development purpose
        //        if(now > endVotingPhase) {
        //            return;
        //        }

        uint i = addressID[msg.sender];

        uint[2] memory yG = voters[i].reconstructedKey;
        uint[2] memory xG = voters[i].registeredKey;

        // Make sure the sender can vote, and hasn't already voted.
        if (registered[msg.sender] && !voteCast[msg.sender]) {
            // Verify the ZKP for the vote being cast
            if (verify1outof2ZKP(params, xG, yG, y, a1, b1, a2, b2)) {

                voters[i].vote[0] = y[0];
                voters[i].vote[1] = y[1];

                voteCast[msg.sender] = true;

                totalVoted += 1;

                // Refund the sender their ether..
                // Voter has finished their part of the protocol...
                uint refund = refunds[msg.sender];
                refunds[msg.sender] = 0;

                // We can still fail... Safety first.
                // If failed... voter can call withdrawRefund()
                // to collect their money once the election has finished.
                if (!msg.sender.send(refund)) {
                    refunds[msg.sender] = refund;
                }

                return true;
            }
        }

        // Either vote has already been cast, or ZKP verification failed.
        return false;
    }

    function computeTally() inState(State.VOTE) onlyOwner {
        uint[2] memory G;
        G[0] = Gx;
        G[1] = Gy;
        uint[3] memory temp;
        uint[2] memory vote;
        uint refund;

        // Sum all votes
        for (uint i = 0; i < totalRegistered; i++) {

            // Confirm all votes have been cast...
            if (!voteCast[voters[i].addr]) {
                revert();
            }

            vote = voters[i].vote;

            if (i == 0) {
                temp[0] = vote[0];
                temp[1] = vote[1];
                temp[2] = 1;
            } else {
                Secp256k1._addMixedM(temp, vote);
            }
        }

        // All votes have been accounted for...
        // Get tally, and change state to 'Finished'
        currentState = State.FINISH;


        // Each vote is represented by a G.
        // If there are no votes... then it is 0G = (0,0)...
        if (temp[0] == 0) {
            finalTally[0] = 0;
            finalTally[1] = totalRegistered;

            // Election Authority is responsible for calling this....
            // He should not fail his own refund...
            // Make sure tally is computed before refunding...
            // TODO: Check if this is necessary
            refund = refunds[msg.sender];
            refunds[msg.sender] = 0;

            if (!msg.sender.send(refund)) {
                refunds[msg.sender] = refund;
            }
            return;
        } else {

            // There must be a vote. So lets
            // start adding 'G' until we
            // find the result.
            ECCMath.toZ1(temp, pp);
            uint[3] memory tempG;
            tempG[0] = G[0];
            tempG[1] = G[1];
            tempG[2] = 1;

            // Start adding 'G' and looking for a match
            for (i = 1; i <= totalRegistered; i++) {

                if (temp[0] == tempG[0]) {
                    finalTally[0] = i;
                    finalTally[1] = totalRegistered;

                    // Election Authority is responsible for calling this....
                    // He should not fail his own refund...
                    // Make sure tally is computed before refunding...
                    // TODO: Check if this is necessary
                    // If it fails - he can use withdrawRefund()
                    // Election cannot be reset until he is refunded.
                    refund = refunds[msg.sender];
                    refunds[msg.sender] = 0;

                    if (!msg.sender.send(refund)) {
                        refunds[msg.sender] = refund;
                    }
                    return;
                }

                // If something bad happens and we cannot find the Tally
                // Then this 'addition' will be run 1 extra time due to how
                // we have structured the for loop.
                // TODO: Does it need fixes?
                Secp256k1._addMixedM(tempG, G);
                ECCMath.toZ1(tempG, pp);
            }

            // Something bad happened. We should never get here....
            // This represents an error message... best telling people
            // As we cannot recover from it anyway.
            // TODO: Handle this better....
            finalTally[0] = 0;
            finalTally[1] = 0;

            // Election Authority is responsible for calling this....
            // He should not fail his own refund...
            // TODO: Check if this is necessary
            refund = refunds[msg.sender];
            refunds[msg.sender] = 0;

            if (!msg.sender.send(refund)) {
                refunds[msg.sender] = refund;
            }
            return;
        }
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



    // Parameters xG, r where r = v - xc, and vG.
    // Verify that vG = rG + xcG!
    function verifyKey(uint[2] xG, uint r, uint[3] vG) public returns (bool) {
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

    // We verify that the ZKP is of 0 or 1.
    // params[4] input is res2[4] from the creator

    // We verify that the ZKP is of 0 or 1.
    function verify1outof2ZKP(uint[4] params, uint[2] xG, uint[2] yG, uint[2] y, uint[2] a1, uint[2] b1, uint[2] a2, uint[2] b2) returns (bool) {
        uint[2] memory temp1;
        uint[3] memory temp2;
        uint[3] memory temp3;

        uint[2] memory G;
        G[0] = Gx;
        G[1] = Gy;


        // Make sure we are only dealing with valid public keys!
        if (!Secp256k1.isPubKey(xG) || !Secp256k1.isPubKey(yG) || !Secp256k1.isPubKey(y) || !Secp256k1.isPubKey(a1) ||
        !Secp256k1.isPubKey(b1) || !Secp256k1.isPubKey(a2) || !Secp256k1.isPubKey(b2)) {
            return false;
        }

        // Does c =? d1 + d2 (mod n)
        if (uint(sha256(abi.encode(msg.sender, xG, y, a1, b1, a2, b2))) != addmod(params[0], params[1], nn)) {
            return false;
        }

        // a1 =? g^{r1} * x^{d1}
        temp2 = Secp256k1._mul(params[2], G);
        temp3 = Secp256k1._add(temp2, Secp256k1._mul(params[0], xG));
        ECCMath.toZ1(temp3, pp);

        if (a1[0] != temp3[0] || a1[1] != temp3[1]) {
            return false;
        }

        //b1 =? h^{r1} * y^{d1} (temp = affine 'y')
        temp2 = Secp256k1._mul(params[2], yG);
        temp3 = Secp256k1._add(temp2, Secp256k1._mul(params[0], y));
        ECCMath.toZ1(temp3, pp);

        if (b1[0] != temp3[0] || b1[1] != temp3[1]) {
            return false;
        }

        //a2 =? g^{r2} * x^{d2}
        temp2 = Secp256k1._mul(params[3], G);
        temp3 = Secp256k1._add(temp2, Secp256k1._mul(params[1], xG));
        ECCMath.toZ1(temp3, pp);

        if (a2[0] != temp3[0] || a2[1] != temp3[1]) {
            return false;
        }

        // Negate the 'y' co-ordinate of g
        temp1[0] = G[0];
        temp1[1] = pp - G[1];

        // get 'y'
        temp3[0] = y[0];
        temp3[1] = y[1];
        temp3[2] = 1;

        // y-g
        temp2 = Secp256k1._addMixed(temp3, temp1);

        // Return to affine co-ordinates
        ECCMath.toZ1(temp2, pp);
        temp1[0] = temp2[0];
        temp1[1] = temp2[1];

        // (y-g)^{d2}
        temp2 = Secp256k1._mul(params[1], temp1);

        // Now... it is h^{r2} + temp2..
        temp3 = Secp256k1._add(Secp256k1._mul(params[3], yG), temp2);

        // Convert to Affine Co-ordinates
        ECCMath.toZ1(temp3, pp);

        // Should all match up.
        if (b2[0] != temp3[0] || b2[1] != temp3[1]) {
            return false;
        }

        return true;
    }
}