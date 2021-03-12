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
  var file = './airdop.csv'
  var sendFile = path.join(__dirname, file)
  var resultSendFile = path.join(__dirname, file + '.out.csv')
  var resultFileData = ''
  try {
    resultFileData = fs.readFileSync(resultSendFile, 'utf8');
  }
  catch (ex) {
  }

  if (resultFileData.indexOf('Token,TokenAddress,Address,Amount,Tx')  == -1)
  {
    fs.appendFileSync(resultSendFile, `Token,TokenAddress,Address,Amount,Tx\n`)
  }

  var data = await readFileCsv(sendFile)
  for (var i = 0; i < data.length; i++) {
    if (resultFileData.indexOf(`${data[i].TokenAddress},${data[i].Address}`) >= 0) {
      console.log('Skip: Sent > ', `${data[i].Token}, ${data[i].TokenAddress}, ${data[i].Address}, ${data[i].Amount}`)
    }
    else {
      console.log(data[i].Token, data[i].Address, data[i].Amount)
      if (data[i].Token.toString().toUpperCase() === 'TOMO') {
        console.log(data[i].Address.trim())
        var hash = await methods.transfer(data[i].Amount)
          .to(data[i].Address.trim())
          .from(process.env.PRIVATE_KEY)
        resultFileData += `TOMO,,${data[i].Address},${data[i].Amount},${hash}\n`
        fs.appendFileSync(resultSendFile, `TOMO,,${data[i].Address},${data[i].Amount},${hash}\n`)
      }
      else if (data[i].TokenAddress) {
        var hash = await methods.transfer(data[i].Amount)
          .token(data[i].TokenAddress)
          .to(data[i].Address.trim())
          .from(process.env.PRIVATE_KEY)
        resultFileData += `${data[i].Token},${data[i].TokenAddress},${data[i].Address},${data[i].Amount},${hash}\n`
        fs.appendFileSync(resultSendFile, `${data[i].Token},${data[i].TokenAddress},${data[i].Address},${data[i].Amount},${hash}\n`)
      }
      else {
        console.log('Skip: Invalid format > ', `${data[i].Token}, ${data[i].TokenAddress}, ${data[i].Address}, ${data[i].Amount}`)
      }
    }
  }
}

send()