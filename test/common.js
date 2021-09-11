/* eslint-disable */
const { MongoClient } = require('mongodb');
require('dotenv').config();


let client;
let db;

let accountsHistory;
let nftHistory;
let marketHistory;


async function setupDB() {
  client = await MongoClient.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  db = await client.db(process.env.DATABASE_NAME);
  accountsHistory = await db.collection('accountsHistory');
  nftHistory = await db.collection('nftHistory');
  marketHistory = await db.collection('marketHistory');
}

async function destroyDB() {
  await client.close();
}

async function findTransaction(transactionId) {
  return accountsHistory.find({ transactionId: transactionId }).sort({_id: 1})
    .toArray();
}

module.exports.setupDB = setupDB;
module.exports.destroyDB = destroyDB;
module.exports.findTransaction = findTransaction;
