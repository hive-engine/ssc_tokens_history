/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
require('dotenv').config();
const { MongoClient } = require('mongodb');
const nodeCleanup = require('node-cleanup');
const fs = require('fs-extra');
const SSC = require('sscjs');
const { Queue } = require('./libs/Queue');
const config = require('./config');

const {
  Contracts,
  TokensContract,
} = require('./history_builder.constants');

const { parseNftContract } = require('./contracts/nft');
const { parseMiningContract } = require('./contracts/mining');
const { parseWitnessesContract } = require('./contracts/witnesses');
const { parseHivePeggedContract } = require('./contracts/hivepegged');
const { parseTokensContract } = require('./contracts/tokens');
const { parseInflationContract } = require('./contracts/inflation');
const { parseMarketContract } = require('./contracts/market');


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
let marketHistoryColl = null;

let { lastSSCBlockParsed } = config; // eslint-disable-line prefer-const



async function parseNftMarketContract(sender, contract, action, tx, events, payloadObj) {
  // TODO implement contract
}

async function parseBotControllerContract(sender, contract, action, tx, events, payloadObj) {
  // TODO implement contract
}

async function parseMarketPoolsContract(sender, contract, action, tx, events, payloadObj) {
  // TODO implement contract
}

async function parseCritterManagerContract(sender, contract, action, tx, events, payloadObj) {
  // TODO implement contract
}

function ignoreContractAction(contract, action) {
  switch (contract) {
    case Contracts.CONTRACT:
      return true;
    case Contracts.TOKENS:
      return action === TokensContract.UPDATE_PARAMS;
    default:
      return false;
  }
}

async function parseTx(tx, blockNumber, dateTimestamp, finalTimestamp) {
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
  } else if (ignoreContractAction(contract, action)) {
    // ignore contract / action
  } else if (contract === Contracts.TOKENS) {
    await parseTokensContract(accountsHistoryColl, sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.MARKET) {
    await parseMarketContract(accountsHistoryColl, marketHistoryColl, sender, contract, action, finalTx, events, payloadObj, dateTimestamp);
  } else if (contract === Contracts.NFT) {
    await parseNftContract(accountsHistoryColl, sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.WITNESSES) {
    await parseWitnessesContract(accountsHistoryColl, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.HIVE_PEGGED) {
    await parseHivePeggedContract(accountsHistoryColl, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.NFT_MARKET) {
    await parseNftMarketContract(sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.MINING) {
    await parseMiningContract(accountsHistoryColl, sender, contract, action, finalTx, events);
  } else if (contract === Contracts.BOT_CONTROLLER) {
    await parseBotControllerContract(sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.MARKET_POOLS) {
    await parseMarketPoolsContract(sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.INFLATION) {
    await parseInflationContract(accountsHistoryColl, sender, contract, action, finalTx, events, payloadObj);
  } else if (contract === Contracts.CRITTER_MANAGER) {
    await parseCritterManagerContract(sender, contract, action, finalTx, events, payloadObj);
  } else {
    console.log(`Contract ${contract} is not implemented yet.`);
  }
}

async function parseBlock(block) {
  const {
    transactions,
    virtualTransactions,
    timestamp,
    blockNumber,
  } = block;

  console.log(`parsing block #${blockNumber}`); // eslint-disable-line no-console

  const blockDate = new Date(`${timestamp}.000Z`);
  const stringDate = `${blockDate.getFullYear()}-${(blockDate.getMonth() + 1).toString().padStart(2, '0')}-${(blockDate.getDate()).toString().padStart(2, '0')}`;
  const dateTimestamp = new Date(stringDate).getTime() / 1000;
  const finalTimestamp = blockDate.getTime() / 1000;

  const allTransactions = transactions.concat(virtualTransactions);
  for (let index = 0; index < allTransactions.length; index += 1) {
    const tx = allTransactions[index];
    await parseTx(tx, blockNumber, dateTimestamp, finalTimestamp);
  }

  lastSSCBlockParsed = blockNumber;
}

async function parseSSCChain(blockNumber) {
  try {
    const block = await ssc.getBlockInfo(blockNumber);

    if (block !== null) {
      await parseBlock(block);

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
      await accountsHistoryColl.createIndex({ account: 1, symbol: 1, timestamp: -1 });
      await accountsHistoryColl.createIndex({ transactionId: 1 });
      marketHistoryColl = await db.createCollection('marketHistory');
      await marketHistoryColl.createIndex({ symbol: 1, timestamp: -1 });
    } else {
      accountsHistoryColl = collection;
      marketHistoryColl = db.collection('marketHistory');
    }

    parseSSCChain(lastSSCBlockParsed);
  });
};

init();

// graceful app closing
nodeCleanup((exitCode, signal) => { // eslint-disable-line no-unused-vars
  client.close();
  console.log('start saving conf'); // eslint-disable-line no-console
  const conf = fs.readJSONSync('./config.json');
  conf.lastSSCBlockParsed = lastSSCBlockParsed + 1;
  fs.writeJSONSync('./config.json', conf, { spaces: 4 });
  console.log('done saving conf'); // eslint-disable-line no-console
});
