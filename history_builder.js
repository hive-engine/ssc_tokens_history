/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const nodeCleanup = require('node-cleanup');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs-extra');
const SSC = require('sscjs');
const { Queue } = require('./libs/Queue');
const config = require('./config');

const {
  Contracts,
} = require('./history_builder.constants');

const { parseNftContract } = require('./contracts/nft');
const { parseMiningContract } = require('./contracts/mining');
const { parseWitnessesContract } = require('./contracts/witnesses');
const { parseHivePeggedContract } = require('./contracts/hivepegged');
const { parseTokensContract } = require('./contracts/tokens');
const { parseInflationContract } = require('./contracts/inflation');
const { parseMarketContract } = require('./contracts/market');
const { parseNftMarketContract } = require('./contracts/nftmarket');
const { parseMarketPoolsContract } = require('./contracts/marketpools');
const { parseBotControllerContract } = require('./contracts/botcontroller');
const { parseCritterManagerContract } = require('./contracts/crittermanager');


const sscNodes = new Queue();
config.nodes.forEach(node => sscNodes.push(node));

const getSSCNode = () => {
  const node = sscNodes.pop();
  sscNodes.push(node);

  console.log('Using SSC node:', node); // eslint-disable-line no-console
  return node;
};

let ssc = new SSC(getSSCNode());
let client = null;
let db = null;
let accountsHistoryColl = null;
let nftHistoryColl = null;
let marketHistoryColl = null;

let { lastSSCBlockParsed } = config; // eslint-disable-line prefer-const

function ignoreContract(contract) {
  if (config && config.ignoreContracts && config.ignoreContracts instanceof Array) {
    if (config.ignoreContracts.includes(contract)) {
      return true;
    }
  }
  switch (contract) {
    case Contracts.CONTRACT:
      return true;
    default:
      return false;
  }
}

async function parseTx(tx, blockNumber, dateTimestamp, finalTimestamp, accountsHistory, nftHistory, marketHistory) {
  const {
    sender,
    contract,
    action,
    transactionId,
    payload,
    logs,
  } = tx;

  const finalTx = {
    blockNumber,
    transactionId,
    timestamp: finalTimestamp,
    operation: `${contract}_${action}`,
  };

  const logsObj = JSON.parse(logs);
  const payloadObj = payload ? JSON.parse(payload) : null; // payload is null for virtual txs
  const { events, errors } = logsObj;

  if (errors !== undefined) {
    // an error occurred -> no need to process the transaction
  } else if (ignoreContract(contract)) {
    // ignore the given contract
  } else if (contract === Contracts.TOKENS) {
    await parseTokensContract(accountsHistory, sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.MARKET) {
    await parseMarketContract(accountsHistory, marketHistory, sender, contract, action, finalTx, events, payloadObj, dateTimestamp);
  } else if (contract === Contracts.NFT) {
    await parseNftContract(accountsHistory, nftHistory, sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.WITNESSES) {
    await parseWitnessesContract(accountsHistory, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.HIVE_PEGGED) {
    await parseHivePeggedContract(accountsHistory, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.NFT_MARKET) {
    await parseNftMarketContract(accountsHistory, nftHistory, sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.MINING) {
    await parseMiningContract(accountsHistory, sender, contract, action, finalTx, events);
  } else if (contract === Contracts.BOT_CONTROLLER) {
    await parseBotControllerContract(accountsHistory, sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.MARKET_POOLS) {
    await parseMarketPoolsContract(accountsHistory, sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.INFLATION) {
    await parseInflationContract(accountsHistory, sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.CRITTER_MANAGER) {
    await parseCritterManagerContract(accountsHistory, sender, contract, action, finalTx, events, payloadObj);
  } else {
    console.log(`Contract ${contract} is not implemented yet.`);
  }
}

async function parseBlock(block, accountsHistory, nftHistory, marketHistory) {
  const {
    transactions,
    virtualTransactions,
    timestamp,
    blockNumber,
  } = block;

  console.log(`parsing block #${blockNumber}`);

  const blockDate = new Date(`${timestamp}.000Z`);
  const stringDate = `${blockDate.getFullYear()}-${(blockDate.getMonth() + 1).toString().padStart(2, '0')}-${(blockDate.getDate()).toString().padStart(2, '0')}`;
  const dateTimestamp = new Date(stringDate).getTime() / 1000;
  const finalTimestamp = blockDate.getTime() / 1000;

  const allTransactions = transactions.concat(virtualTransactions);
  for (let index = 0; index < allTransactions.length; index += 1) {
    const tx = allTransactions[index];
    await parseTx(tx, blockNumber, dateTimestamp, finalTimestamp, accountsHistory, nftHistory, marketHistory);
  }
}

async function parseSSCChain(blockNumber) {
  try {
    const block = await ssc.getBlockInfo(blockNumber);

    if (block !== null) {
      await parseBlock(block, accountsHistoryColl, nftHistoryColl, marketHistoryColl);
      lastSSCBlockParsed = blockNumber;

      parseSSCChain(blockNumber + 1);
    } else {
      setTimeout(() => parseSSCChain(blockNumber), config.pollingTime);
    }
  } catch (error) {
    console.log(error);
    ssc = new SSC(getSSCNode());
    setTimeout(() => parseSSCChain(blockNumber), config.pollingTime);
  }
}

const init = async () => {
  client = await MongoClient.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
  db = client.db(process.env.DATABASE_NAME);
  db.collection('accountsHistory', { strict: true }, async (err, collection) => {
    // collection does not exist
    if (err) {
      console.log('creating collections');
      accountsHistoryColl = await db.createCollection('accountsHistory');
      await accountsHistoryColl.createIndex({ account: 1, symbol: 1, operation: 1, timestamp: -1 });
      await accountsHistoryColl.createIndex({ transactionId: 1 });
      await accountsHistoryColl.createIndex({ timestamp: -1 });
      nftHistoryColl = await db.createCollection('nftHistory');
      await nftHistoryColl.createIndex({ nftId: 1, account: 1, symbol: 1, timestamp: -1 });
      await nftHistoryColl.createIndex({ account: 1, symbol: 1, timestamp: -1 });
      await nftHistoryColl.createIndex({ timestamp: -1 });
      marketHistoryColl = await db.createCollection('marketHistory');
      await marketHistoryColl.createIndex({ symbol: 1, timestamp: -1 });
      await marketHistoryColl.createIndex({ timestamp: -1 });
    } else {
      accountsHistoryColl = collection;
      nftHistoryColl = db.collection('nftHistory');
      marketHistoryColl = db.collection('marketHistory');

      // rollback if txs of the @lastSSCBlockParsed block have already been written
      console.log(`Starting rollback for block ${lastSSCBlockParsed}.`);
      const block = await ssc.getBlockInfo(lastSSCBlockParsed);
      if (block) {
        const { timestamp } = block;

        const blockDate = new Date(`${timestamp}.000Z`);
        const finalTimestamp = blockDate.getTime() / 1000;

        await accountsHistoryColl.deleteMany({
          timestamp: {
            $gte: finalTimestamp,
          },
        });
        await nftHistoryColl.deleteMany({
          timestamp: {
            $gte: finalTimestamp,
          },
        });
        await marketHistoryColl.deleteMany({
          timestamp: {
            $gte: finalTimestamp,
          },
        });
        console.log(`Finished rollback with timestamp >= ${finalTimestamp}.`);
      }
    }

    parseSSCChain(lastSSCBlockParsed);
  });

  // graceful app closing
  nodeCleanup((exitCode, signal) => { // eslint-disable-line no-unused-vars
    client.close();
    console.log('start saving conf'); // eslint-disable-line no-console
    const conf = fs.readJSONSync('./config.json');
    conf.lastSSCBlockParsed = lastSSCBlockParsed + 1;
    fs.writeJSONSync('./config.json', conf, { spaces: 4 });
    console.log('done saving conf'); // eslint-disable-line no-console
  });
};


module.exports.init = init;
