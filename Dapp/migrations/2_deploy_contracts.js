var EccOperationsLib = artifacts.require("./ECCMath_noconflict.sol");
var CurveParamsLib = artifacts.require("./Secp256k1_noconflict.sol");
var SimpleStorage = artifacts.require("./SimpleStorage.sol");


module.exports = function(deployer) {
  deployer.deploy(EccOperationsLib);
  deployer.link(EccOperationsLib, CurveParamsLib);
  deployer.deploy(CurveParamsLib);
  deployer.link(CurveParamsLib, SimpleStorage);
  deployer.deploy(SimpleStorage);
};
