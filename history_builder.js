require('dotenv').config();
const { Pool } = require('pg');
const nodeCleanup = require('node-cleanup');
const fs = require('fs-extra');
const SSC = require('sscjs');
const config = require('./config');

const ssc = new SSC(config.node);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const SSCChainPollingTime = 3000;
const TOKENSCONTRACTNAME = 'tokens';
const ISSUEACTIONNAME = 'issue';
const TRANSFERACTIONNAME = 'transfer';

let { lastSSCBlockParsed } = config; // eslint-disable-line prefer-const

async function parseBlock(block) {
  console.log(`parsing block #${block.blockNumber}`); // eslint-disable-line no-console

  const { transactions, timestamp } = block;
  const nbTxs = transactions.length;

  for (let index = 0; index < nbTxs; index += 1) {
    const tx = transactions[index];
    const {
      transactionId,
      sender,
      contract,
      action,
      payload,
      logs,
    } = tx;
    if (contract === TOKENSCONTRACTNAME && logs === '{}' && (action === ISSUEACTIONNAME || action === TRANSFERACTIONNAME)) {
      const objPayload = JSON.parse(payload);
      // add the transaction to the history
      const { to, symbol, quantity } = objPayload;
      const query = 'INSERT INTO transactions("txid", "timestamp", "type", "symbol", "from", "to", "quantity") VALUES($1, $2, $3, $4, $5, $6, $7)';
      const values = [transactionId, timestamp, action, symbol, sender, to, quantity];
      await pool.query(query, values); // eslint-disable-line no-await-in-loop
    }
  }

  lastSSCBlockParsed = block.blockNumber;
}

async function parseSSCChain(blockNumber) {
  const block = await ssc.getBlockInfo(blockNumber);
  let newBlockNumber = blockNumber;

  if (block !== null) {
    newBlockNumber += 1;
    await parseBlock(block);

    setTimeout(() => parseSSCChain(newBlockNumber), SSCChainPollingTime);
  } else {
    setTimeout(() => parseSSCChain(newBlockNumber), SSCChainPollingTime);
  }
}

parseSSCChain(lastSSCBlockParsed);

// graceful app closing
nodeCleanup((exitCode, signal) => { // eslint-disable-line no-unused-vars
  console.log('start saving conf'); // eslint-disable-line no-console
  const conf = fs.readJSONSync('./config.json');
  conf.lastSSCBlockParsed = lastSSCBlockParsed;
  fs.writeJSONSync('./config.json', conf);
  pool.end();
  console.log('done saving conf'); // eslint-disable-line no-console
});
