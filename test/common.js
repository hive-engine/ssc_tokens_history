/* eslint-disable */
const { MongoClient } = require('mongodb');
require('dotenv').config();
const { createCollections, parseBlock } = require('../history_builder');

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
  db = await client.db(process.env.DATABASE_NAME + '_test');
  await db.dropDatabase();
  await createCollections(db);
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

async function runParseBlock(block) {
  await parseBlock(block, accountsHistory, nftHistory, marketHistory);
}

module.exports.setupDB = setupDB;
module.exports.destroyDB = destroyDB;
module.exports.findTransaction = findTransaction;
module.exports.runParseBlock = runParseBlock;
