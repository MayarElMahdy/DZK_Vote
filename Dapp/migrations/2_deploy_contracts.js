var EccOperationsLib = artifacts.require("./ECCMath_noconflict.sol");
var CurveParamsLib = artifacts.require("./Secp256k1_noconflict.sol");
var ownedContract = artifacts.require("./Owned.sol");
var votingContract = artifacts.require("./VotingSys.sol");


module.exports = function (deployer) {
    deployer.deploy(EccOperationsLib);
    deployer.link(EccOperationsLib, CurveParamsLib);
    deployer.deploy(CurveParamsLib);
    deployer.deploy(ownedContract);
    deployer.link(CurveParamsLib, votingContract);
    deployer.link(ownedContract, votingContract);
    deployer.deploy(votingContract);
};
