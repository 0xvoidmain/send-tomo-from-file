const Web3 = require('web3')
const BigNumber = require('bignumber.js')
const config = require('./config')
const web3 = new Web3(config.RPC)
const Contract = require('./contract')

const GAS_LIMIT = config.GAS_LIMIT
const GAS_PRICE = config.GAS_PRICE

const abi = require('./abi')

async function transfer(privateKey, toAddress, amount, data) {
  if (!web3.utils.isAddress(toAddress)) {
    throw Error("Invalid address")
  }

  if (isNaN(parseFloat(amount))) {
    throw Error("Invalid amount")
  }

  var account = web3.eth.accounts.privateKeyToAccount(privateKey);
  const [nonce, balance] = await Promise.all([
    web3.eth.getTransactionCount(account.address),
    web3.eth.getBalance(account.address)
  ])
  var amount = new BigNumber(amount).multipliedBy(10 ** 18)

  if (BigNumber(GAS_PRICE)
    .multipliedBy(GAS_LIMIT)
    .plus(amount)
    .isGreaterThan(balance)) {
    throw Error("Not enough balance")
  }

  var signedTx = await web3.eth.accounts.signTransaction({
    from: account.address,
    to: toAddress,
    nonce: nonce,
    value: amount,
    data: data,
    gas: GAS_LIMIT,
    gasPrice: GAS_PRICE,
    chainId: config.NETWORK_ID
  }, privateKey)
  var transactionHash = web3.utils.sha3(signedTx.rawTransaction, { encoding: "hex" });
  await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

  return transactionHash
}

async function transferToken(privateKey, toAddress, token, amount) {
  if (!web3.utils.isAddress(toAddress)) {
    throw Error("Invalid address")
  }

  if (!web3.utils.isAddress(token)) {
    throw Error("Invalid token address")
  }

  if (isNaN(parseFloat(amount))) {
    throw Error("Invalid amount")
  }

  var account = web3.eth.accounts.privateKeyToAccount(privateKey);
  var [balance, decimals] = await Promise.all([
    Contract(token, abi.TRC20)
      .methods('balanceOf')
      .params(account.address)
      .call(),
    Contract(token, abi.TRC20)
      .methods('decimals')
      .params()
      .call(),
  ])

  var amount = new BigNumber(amount).multipliedBy(10 ** decimals)

  if (BigNumber(amount).isGreaterThan(balance)) {
    throw Error("Not enough balance")
  }

  return await Contract(token, abi.TRC20)
    .methods('transfer')
    .params({to: toAddress, tokens: amount})
    .send(privateKey)
}

module.exports = (amount, data) => ({
  to: (address) => ({
    from: (privateKey) => transfer(privateKey, address, amount, data)
  }),
  from: (privateKey) => ({
    to: (address) => transfer(privateKey, address, amount, data)
  }),
  token: (token) => ({
    to: (address) => ({
      from: (privateKey) => transferToken(privateKey, address, token, amount)
    }),
    from: (privateKey) => ({
      to: (address) => transferToken(privateKey, address, token, amount)
    }),
  })
})