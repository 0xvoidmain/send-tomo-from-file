# Install

```
npm install
```

# Send tomo via csv file

## File format

```
Token,TokenAddress,Address,Amount
XXXX,0x4cD6cfB32A8699386E65b591f02819e34e4e4B4C,0x86c7e2facc45d0a28f9dc96f7adb4bf0327bcc5e,61
TOMO,0x4cD6cfB32A8699386E65b591f02819e34e4e4B4C,0xeb6520682d8de2c10d6f73853f1d222d6d55fa9f,61

```

## Send via command

step 1: create `.evn` file with `.env_sample` file

step 2: edit file airdrop.csv with format above

step 3: run command `node index.js`
