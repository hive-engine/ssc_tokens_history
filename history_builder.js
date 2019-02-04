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
      payload,
      logs,
    } = tx;

    const logsObj = JSON.parse(logs);
    let payloadObj = null;

    if (logsObj) {
      const { events } = logsObj;

      if (events && events.length > 0) {
        let txToSave = false;
        let values;
        const nbEvents = events.length;

        for (let idx = 0; idx < nbEvents; idx += 1) {
          const ev = events[idx];
          const finalTxId = nbEvents > 1 ? `${transactionId}-${idx}` : transactionId;

          if (ev.contract === TOKENS_CONTRACT_NAME) {
            const {
              from,
              to,
              symbol,
              quantity,
            } = ev.data;

            if (ev.event === TRANSFER) {
              values = [blockNumber, finalTxId, finalTimestamp, symbol, from, 'user', to, 'user', quantity];

              txToSave = true;
            } else if (ev.event === TRANSFER_TO_CONTRACT) {
              values = [blockNumber, finalTxId, finalTimestamp, symbol, from, 'user', to, 'contract', quantity];

              txToSave = true;
            } else if (ev.event === TRANSFER_FROM_CONTRACT) {
              values = [blockNumber, finalTxId, finalTimestamp, symbol, from, 'contract', to, 'user', quantity];

              txToSave = true;
            }

            if (txToSave) {
              // check if there is a memo in the transfer
              if (payloadObj === null) {
                payloadObj = JSON.parse(payload);
              }

              const { memo } = payloadObj;
              let query = '';

              if (memo && typeof memo === 'string') {
                values.push(memo);
                query = 'INSERT INTO transactions("block", "txid", "timestamp", "symbol", "from", "from_type", "to", "to_type", "quantity", "memo") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
              } else {
                query = 'INSERT INTO transactions("block", "txid", "timestamp", "symbol", "from", "from_type", "to", "to_type", "quantity") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)';
              }

              // add the transaction to the history
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

      setTimeout(() => parseSSCChain(newBlockNumber), config.pollingTime);
    } else {
      setTimeout(() => parseSSCChain(newBlockNumber), config.pollingTime);
    }
  } catch (error) {
    console.log(error);
    ssc = new SSC(getSSCNode());
    setTimeout(() => parseSSCChain(blockNumber), config.pollingTime);
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
