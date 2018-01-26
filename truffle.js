module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4700000
    },
    truffle_develop: {
      host: "localhost",
      port: 9545,
      network_id: "*", // Match any network id
      gas: 4700000
    }
  }
};
