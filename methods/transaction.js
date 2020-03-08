const Web3 = require('web3')
const config = require('./config')
const web3 = new Web3(config.RPC)

module.exports = function(txHash) {
  return web3.eth.getTransaction(txHash)
}