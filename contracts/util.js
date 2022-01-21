/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */

const config = require('../config');

async function insertHistoryForAccount(collection, tx, account) {
  const insertTx = tx;
  insertTx._id = null;
  insertTx.account = account;

  const { symbol } = insertTx;
  if (symbol && config && config.ignoreSymbols && config.ignoreSymbols instanceof Array && config.ignoreSymbols.includes(symbol)) {
    return;
  }
  await collection.insertOne(insertTx);
}

async function insertHistoryForNft(collection, nftId, otherTx) {
  const nftTx = {
    nftId: `${nftId}`,
    symbol: otherTx.symbol,
    account: otherTx.account,
    timestamp: otherTx.timestamp,
    accountHistoryId: otherTx._id,
  };
  const { symbol } = otherTx.symbol;
  if (symbol && config && config.ignoreSymbols && config.ignoreSymbols instanceof Array && config.ignoreSymbols.includes(symbol)) {
    return;
  }
  await collection.insertOne(nftTx);
}

async function insertHistoryForAccounts(collection, tx, accounts) {
  const inserted = [];
  for (let i = 0; i < accounts.length; i += 1) {
    const account = accounts[i];
    if (!inserted.includes(account)) {
      inserted.push(account);
      await insertHistoryForAccount(collection, tx, account);
    }
  }
}

async function parseEvents(events, eventCallback) {
  if (events) {
    for (let idx = 0; idx < events.length; idx += 1) {
      await eventCallback(events[idx], idx);
    }
  }
}

module.exports.insertHistoryForAccount = insertHistoryForAccount;
module.exports.insertHistoryForAccounts = insertHistoryForAccounts;
module.exports.insertHistoryForNft = insertHistoryForNft;
module.exports.parseEvents = parseEvents;
