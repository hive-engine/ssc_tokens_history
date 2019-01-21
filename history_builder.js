require('dotenv').config();
const { Pool } = require('pg');
const nodeCleanup = require('node-cleanup');
const fs = require('fs-extra');
const SSC = require('sscjs');
const { Queue } = require('./libs/Queue');
const config = require('./config');

const sscNodes = new Queue();
config.nodes.forEach(node => sscNodes.push(node));

const getSSCNode = () => {
  const node = sscNodes.pop();
  sscNodes.push(node);

  console.log('Using SSC node:', node); // eslint-disable-line no-console
  return node;
};

let ssc = new SSC(getSSCNode());
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const SSCChainPollingTime = 3000;
const TOKENS_CONTRACT_NAME = 'tokens';
const TRANSFER = 'transfer';
const TRANSFER_TO_CONTRACT = 'transferToContract';
const TRANSFER_FROM_CONTRACT = 'transferFromContract';

let { lastSSCBlockParsed } = config; // eslint-disable-line prefer-const

async function parseBlock(block) {
  const { transactions, timestamp, blockNumber } = block;

  console.log(`parsing block #${blockNumber}`); // eslint-disable-line no-console

  const nbTxs = transactions.length;
  const finalTimestamp = `${timestamp}.000Z`;

  for (let index = 0; index < nbTxs; index += 1) {
    const tx = transactions[index];

    const {
      transactionId,
      logs,
    } = tx;

    const logsObj = JSON.parse(logs);

    if (logsObj) {
      const { events } = logsObj;

      if (events && events.length > 0) {
        let txToSave = false;
        let values;
        const nbEvents = events.length;

        for (let idx = 0; index < nbEvents; index += 1) {
          const ev = events[idx];

          if (ev.contract === TOKENS_CONTRACT_NAME) {
            const {
              from,
              to,
              symbol,
              quantity,
            } = ev.data;

            if (ev.event === TRANSFER) {
              values = [blockNumber, transactionId, finalTimestamp, symbol, from, 'user', to, 'user', quantity];

              txToSave = true;
            } else if (ev.event === TRANSFER_TO_CONTRACT) {
              values = [blockNumber, transactionId, finalTimestamp, symbol, from, 'user', to, 'contract', quantity];

              txToSave = true;
            } else if (ev.event === TRANSFER_FROM_CONTRACT) {
              values = [blockNumber, transactionId, finalTimestamp, symbol, from, 'contract', to, 'user', quantity];

              txToSave = true;
            }

            if (txToSave) {
              // add the transaction to the history
              const query = 'INSERT INTO transactions("block", "txid", "timestamp", "symbol", "from", "from_type", "to", "to_type", "quantity") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';
              await pool.query(query, values); // eslint-disable-line no-await-in-loop
            }
          }
        }
      }
    }
  }

  lastSSCBlockParsed = block.blockNumber;
}

async function parseSSCChain(blockNumber) {
  try {
    const block = await ssc.getBlockInfo(blockNumber);
    let newBlockNumber = blockNumber;

    if (block !== null) {
      newBlockNumber += 1;
      await parseBlock(block);

      setTimeout(() => parseSSCChain(newBlockNumber), SSCChainPollingTime);
    } else {
      setTimeout(() => parseSSCChain(newBlockNumber), SSCChainPollingTime);
    }
  } catch (error) {
    console.log(error);
    ssc = new SSC(getSSCNode());
    setTimeout(() => parseSSCChain(blockNumber), SSCChainPollingTime);
  }
}

parseSSCChain(lastSSCBlockParsed);

// graceful app closing
nodeCleanup((exitCode, signal) => { // eslint-disable-line no-unused-vars
  console.log('start saving conf'); // eslint-disable-line no-console
  const conf = fs.readJSONSync('./config.json');
  conf.lastSSCBlockParsed = lastSSCBlockParsed + 1;
  fs.writeJSONSync('./config.json', conf, { spaces: 4 });
  pool.end();
  console.log('done saving conf'); // eslint-disable-line no-console
});
