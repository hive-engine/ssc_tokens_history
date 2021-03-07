/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */


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

module.exports.insertHistoryForAccount = insertHistoryForAccount;
module.exports.insertHistoryForAccounts = insertHistoryForAccounts;
module.exports.parseEvents = parseEvents;
