/* eslint-disable */
const { MongoClient } = require('mongodb');


let client;
let db;

let accountsHistory;
let nftHistory;
let marketHistory;

const conf = {
  databaseURL: 'mongodb://localhost:27017',
  databaseName: 'hsc_history',
};

async function setupDB() {
  client = await MongoClient.connect(conf.databaseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  db = await client.db(conf.databaseName);
  accountsHistory = await db.collection('accountsHistory');
  nftHistory = await db.collection('nftHistory');
  marketHistory = await db.collection('marketHistory');
}

async function destroyDB() {
  await client.close();
}

async function findTransaction(transactionId) {
  return accountsHistory.find({ transactionId: transactionId })
    .toArray();
}

module.exports.setupDB = setupDB;
module.exports.destroyDB = destroyDB;
module.exports.findTransaction = findTransaction;
