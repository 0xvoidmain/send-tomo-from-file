require('dotenv').config()

const path = require('path')
const methods = require('./methods')
const fs = require('fs')
const csv=require('csvtojson')

async function readFileCsv(path) {
  return new Promise((reslove, reject) => {
    csv()
    .fromFile(path)
    .then((jsonObj)=>{
      reslove(jsonObj)
    })
    .catch(ex => reject)
  })
}

async function send() {
  var file = './airdrop-multisend.csv'
  var sendFile = path.join(__dirname, file)
  var resultSendFile = path.join(__dirname, file + '.out.csv')
  var resultFileData = ''
  try {
    resultFileData = fs.readFileSync(resultSendFile, 'utf8');
  }
  catch (ex) {
  }

  if (resultFileData.indexOf('Address,Amount,Tx')  == -1)
  {
    fs.appendFileSync(resultSendFile, `Address,Amount,Tx\n`)
  }

  
  var data = await readFileCsv(sendFile)

  var ContractAddress = '0xa5f6aeCa610dEff2C407812044c13884009cff27'
  var TokenAddress = '0x06597FFaFD82E66ECeD9209d539032571ABD50d9'
  var amounts = []
  var addresses = []
  for (var i = 0; i < data.length; i++) {
    if (resultFileData.indexOf(`${data[i].Address}`) >= 0) {
      console.log('Skip: Sent > ', `${data[i].Address},${data[i].Amount}`)
    }
    else {
      amounts.push(Math.round(parseFloat(data[i].Amount) + 0.5))
      addresses.push(data[i].Address)
      resultFileData += `${data[i].Address},${data[i].Amount}\n`

      if (amounts.length >= 20 || i == data.length - 1) {
        console.log(addresses)
        var hash = await multiSend(ContractAddress, TokenAddress, 18, amounts, addresses)
        for (var j = 0; j < amounts.length; j++) {
          console.log(`${addresses[j]},${amounts[j]},${hash}`)
          fs.appendFileSync(resultSendFile, `${addresses[j]},${amounts[j]},${hash}\n`)
        }

        amounts = []
        addresses = []
      }
    }
  }
}

async function multiSend(contract, token, decimals, amounts, addresses) {
  return await methods.contract(contract, [{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "decimails",
				"type": "uint256"
			},
			{
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "adds",
				"type": "address[]"
			}
		],
		"name": "sendFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}]).methods('sendFrom')
  .params(token, decimals, amounts, addresses)
  .send(process.env.PRIVATE_KEY)
}

send()