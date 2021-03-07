/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */

const {
  Contracts,
} = require('../history_builder.constants');

async function insertHistoryForAccount(collection, tx, account) {
  const insertTx = tx;
  insertTx._id = null;
  insertTx.account = account;
  await collection.insertOne(insertTx);
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
      eventCallback(events[idx], idx);
    }
  }
}

async function parseTransferOperation(collection, tx, logEvent, payloadObj) {
  const insertTx = tx;
  const {
    from,
    to,
    symbol,
    quantity,
  } = logEvent.data;

  const finalFrom = logEvent.event === 'transferFromContract' ? `contract_${from}` : from;
  const finalTo = logEvent.event === 'transferToContract' || logEvent.event === 'issueToContract' ? `contract_${to}` : to;

  insertTx.from = finalFrom;
  insertTx.to = finalTo;
  insertTx.symbol = symbol;
  insertTx.quantity = quantity;
  insertTx.memo = null;
  const { memo } = payloadObj;
  if (memo && typeof memo === 'string') {
    insertTx.memo = memo;
  }

  await insertHistoryForAccounts(collection, insertTx, [finalFrom, finalTo]);
}

async function parseTransferOperations(collection, tx, events, payloadObj) {
  await parseEvents(events, (event) => {
    if (event.contract === Contracts.TOKENS) {
      parseTransferOperation(collection, tx, event, payloadObj);
    }
  });
}

module.exports.insertHistoryForAccount = insertHistoryForAccount;
module.exports.insertHistoryForAccounts = insertHistoryForAccounts;
module.exports.parseEvents = parseEvents;
module.exports.parseTransferOperation = parseTransferOperation;
module.exports.parseTransferOperations = parseTransferOperations;
