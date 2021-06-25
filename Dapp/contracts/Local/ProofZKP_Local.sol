pragma solidity ^0.4.0;

import "../libraries/Secp256k1.sol";

/*
 * @title ProofZKP_Local
 * Allow local calls to create and verify zkp.
 * This contract should NEVER be deployed to the public blockchain
 * Author: Patrick McCorry
 */

contract ProofZKP_Local {
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

    event Debug(uint x1, uint x2);

    // 2 round anonymous voting protocol
    // TODO: Right now due to gas limits there is an upper limit
    // on the number of participants that we can have voting...
    // I need to split the functions up... so if they cannot
    // finish their entire workload in 1 transaction, then
    // it does the maximum. This way we can chain transactions
    // to complete the job...
    constructor() {
        G[0] = Gx;
        G[1] = Gy;

        Y[0] = Yx;
        Y[1] = Yy;
    }

    // vG (blinding value), xG (public key), x (what we are proving)
    // c = H(g, g^{v}, g^{x});
    // r = v - xz (mod p);
    // return(r,vG)
    function createZKP(uint x, uint v, uint[2] xG) returns (uint[4] res) {
        uint[2] memory G;
        G[0] = Gx;
        G[1] = Gy;

        if (!Secp256k1.isPubKey(xG)) {
            revert();
            //Must be on the curve!
        }

        // Get g^{v}
        uint[3] memory vG = Secp256k1._mul(v, G);

        // Convert to Affine Co-ordinates
        ECCMath.toZ1(vG, pp);

        // Get c = H(g, g^{x}, g^{v});
        bytes32 b_c = sha256(abi.encode(msg.sender, Gx, Gy, xG, vG));
        uint c = uint(b_c);

        // Get 'r' the zkp
        uint xc = mulmod(x, c, nn);

        // v - xc
        uint r = submod(v, xc);

        res[0] = r;
        res[1] = vG[0];
        res[2] = vG[1];
        res[3] = vG[2];
        return;
    }

    // a - b = c;
    function submod(uint a, uint b) returns (uint){
        uint a_nn;

        if (a > b) {
            a_nn = a;
        } else {
            a_nn = a + nn;
        }

        uint c = addmod(a_nn - b, 0, nn);

        return c;
    }

    // random 'w', 'r1', 'd1'
    function create1outof2ZKPNoVote(uint[2] xG, uint[2] yG, uint w, uint r2, uint d2, uint x) returns (uint[10] res, uint[4] res2){
        uint[2] memory temp_affine1;
        uint[2] memory temp_affine2;

        // y = h^{x} * g
        uint[3] memory temp1 = Secp256k1._mul(x, yG);
        ECCMath.toZ1(temp1, pp);

        // Store y_x and y_y
        res[0] = temp1[0];
        res[1] = temp1[1];

        // a1 = g^{w}
        temp1 = Secp256k1._mul(w, G);
        ECCMath.toZ1(temp1, pp);

        // Store a1_x and a1_y
        res[2] = temp1[0];
        res[3] = temp1[1];

        // b1 = h^{w} (where h = g^{y})
        temp1 = Secp256k1._mul(w, yG);
        ECCMath.toZ1(temp1, pp);

        res[4] = temp1[0];
        res[5] = temp1[1];

        // a2 = g^{r2} * x^{d2}
        temp1 = Secp256k1._mul(r2, G);
        temp1 = Secp256k1._add(temp1, Secp256k1._mul(d2, xG));
        ECCMath.toZ1(temp1, pp);

        res[6] = temp1[0];
        res[7] = temp1[1];

        // Negate the 'y' co-ordinate of G
        temp_affine1[0] = G[0];
        temp_affine1[1] = pp - G[1];

        // We need the public key y in affine co-ordinates
        temp_affine2[0] = res[0];
        temp_affine2[1] = res[1];

        // We should end up with y^{d2} + g^{d2} .... (but we have the negation of g.. so y-g).
        temp1 = Secp256k1._add(Secp256k1._mul(d2, temp_affine2), Secp256k1._mul(d2, temp_affine1));

        // Now... it is h^{r2} + temp2..
        temp1 = Secp256k1._add(Secp256k1._mul(r2, yG), temp1);

        // Convert to Affine Co-ordinates
        ECCMath.toZ1(temp1, pp);

        res[8] = temp1[0];
        res[9] = temp1[1];

        // Get c = H(i, xG, Y, a1, b1, a2, b2);
        bytes32 b_c = sha256(abi.encode(msg.sender, xG, res));

        // d1 = c - d2 mod q
        temp1[0] = submod(uint(b_c), d2);

        // r1 = w - (x * d1)
        temp1[1] = submod(w, mulmod(x, temp1[0], nn));

        /* We return the following
        * res[0] = y_x;
        * res[1] = y_y;
        * res[2] = a1_x;
        * res[3] = a1_y;
        * res[4] = b1_x;
        * res[5] = b1_y;
        * res[6] = a2_x;
        * res[7] = a2_y;
        * res[8] = b2_x;
        * res[9] = b2_y;
        * res[10] = d1;
        * res[11] = d2;
        * res[12] = r1;
        * res[13] = r2;
        */
        res2[0] = temp1[0];
        res2[1] = d2;
        res2[2] = temp1[1];
        res2[3] = r2;
    }

    // random 'w', 'r1', 'd1'
    // TODO: Make constant
    function create1outof2ZKPYesVote(uint[2] xG, uint[2] yG, uint w, uint r1, uint d1, uint x) returns (uint[10] res, uint[4] res2) {
        // y = h^{x} * g
        uint[3] memory temp1 = Secp256k1._mul(x, yG);
        Secp256k1._addMixedM(temp1, G);
        ECCMath.toZ1(temp1, pp);
        res[0] = temp1[0];
        res[1] = temp1[1];

        // a1 = g^{r1} * x^{d1}
        temp1 = Secp256k1._mul(r1, G);
        temp1 = Secp256k1._add(temp1, Secp256k1._mul(d1, xG));
        ECCMath.toZ1(temp1, pp);
        res[2] = temp1[0];
        res[3] = temp1[1];

        // b1 = h^{r1} * y^{d1} (temp = affine 'y')
        temp1 = Secp256k1._mul(r1, yG);

        // Setting temp to 'y'
        uint[2] memory temp;
        temp[0] = res[0];
        temp[1] = res[1];

        temp1 = Secp256k1._add(temp1, Secp256k1._mul(d1, temp));
        ECCMath.toZ1(temp1, pp);
        res[4] = temp1[0];
        res[5] = temp1[1];

        // a2 = g^{w}
        temp1 = Secp256k1._mul(w, G);
        ECCMath.toZ1(temp1, pp);

        res[6] = temp1[0];
        res[7] = temp1[1];

        // b2 = h^{w} (where h = g^{y})
        temp1 = Secp256k1._mul(w, yG);
        ECCMath.toZ1(temp1, pp);
        res[8] = temp1[0];
        res[9] = temp1[1];

        // Get c = H(id, xG, Y, a1, b1, a2, b2);
        // id is H(round, voter_index, voter_address, contract_address)...
        bytes32 b_c = sha256(abi.encode(msg.sender, xG, res));
        uint c = uint(b_c);

        // d2 = c - d1 mod q
        temp[0] = submod(c, d1);

        // r2 = w - (x * d2)
        temp[1] = submod(w, mulmod(x, temp[0], nn));

        /* We return the following
        * res[0] = y_x;
        * res[1] = y_y;
        * res[2] = a1_x;
        * res[3] = a1_y;
        * res[4] = b1_x;
        * res[5] = b1_y;
        * res[6] = a2_x;
        * res[7] = a2_y;
        * res[8] = b2_x;
        * res[9] = b2_y;
        * res[10] = d1;
        * res[11] = d2;
        * res[12] = r1;
        * res[13] = r2;
        */
        res2[0] = d1;
        res2[1] = temp[0];
        res2[2] = r1;
        res2[3] = temp[1];
    }

    // We verify that the ZKP is of 0 or 1.
    function verify1outof2ZKP(uint[4] params, uint[2] xG, uint[2] yG, uint[2] y, uint[2] a1, uint[2] b1, uint[2] a2, uint[2] b2) returns (bool) {
        uint[2] memory temp1;
        uint[3] memory temp2;
        uint[3] memory temp3;

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
