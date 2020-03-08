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

async function main() {
  if (!process.argv[2]) {
    console.error('Enter your file')
    return;
  }
  var sendFile = path.join(__dirname, process.argv[2])
  var resultSendFile = path.join(__dirname, process.argv[3] || (process.argv[2] + '.out.csv'))
  var data = await readFileCsv(sendFile)
  console.log(data)
  for (var i = 0; i < data.length; i++) {
    console.log(data[i].Address, data[i].Tomo)
    var hash = await methods.transfer(data[i].Tomo)
      .to(data[i].Address)
      .from('0x33CFD63851FFE5F806B587505B6C2F89C735310633F2F8358D7E22113EC64D55')
    fs.appendFileSync(resultSendFile, `${data[i].Address},${data[i].Tomo},${hash}\n`)
  }
}

main()