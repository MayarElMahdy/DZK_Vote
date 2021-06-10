var eccOperationsLib = artifacts.require("./ECCMath.sol");
var curveParamsLib = artifacts.require("./Secp256k1.sol");
var ownedContract = artifacts.require("./Owned.sol");
var votingContract = artifacts.require("./VotingSys.sol");


// var proofZkpContract_local = artifacts.require("./ProofZKP_Local.sol");

module.exports = function (deployer) {
    deployer.deploy(eccOperationsLib);
    deployer.link(eccOperationsLib, curveParamsLib);
    deployer.deploy(curveParamsLib);
    deployer.deploy(ownedContract);
    deployer.link(curveParamsLib, votingContract);
    deployer.link(ownedContract, votingContract);
    deployer.deploy(votingContract);
};