module.exports = {
  RPC: process && process.env && process.env.RPC || 'https://testnet.tomochain.com',
  NETWORK_ID: process && process.env && process.env.NETWORK_ID || '89',
  GAS_LIMIT: process && process.env && process.env.GAS_LIMIT || '2000000',
  GAS_PRICE: process && process.env && process.env.GAS_PRICE || '250000000'
}