const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join( "./../src/contracts"),
  networks: {
    development: {
        host: "127.0.0.1",
        port: 5500,
        network_id: "*"
    }
  },
  compilers: {
    solc: {
      version: "^0.4.0"
    }
  }

};