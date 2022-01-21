/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const {
  insertHistoryForAccount,
} = require('./util');

const { MiningContract } = require('../history_builder.constants');
const { defaultParseEvents } = require('./default');


async function parseLotteryOperation(collection, sender, contract, action, tx, events) {
  const insertTx = tx;

  if (events && events.length > 1) {
    const {
      poolId,
      winners,
    } = events[0].data;
    const {
      symbol,
    } = events[1].data;
    for (let i = 0; i < winners.length; i += 1) {
      insertTx.poolId = poolId;
      insertTx.symbol = symbol;
      insertTx.quantity = winners[i].winningAmount;
      insertTx.operation = `${contract}_lottery`;
      await insertHistoryForAccount(collection, insertTx, winners[i].winner);
    }
  }
}


async function parseMiningContract(accountsHistory, nftHistory, sender, contract, action, tx, events) {
  switch (action) {
    case MiningContract.CHECK_PENDING_LOTTERIES:
      await parseLotteryOperation(accountsHistory, sender, contract, action, tx, events);
      break;
    case MiningContract.CREATE_POOL:
      // TODO implement action #2329024
      await defaultParseEvents(accountsHistory, nftHistory, tx, events, payloadObj);
      break;
    case MiningContract.UPDATE_POOL:
      // TODO implement action #2528810
      await defaultParseEvents(accountsHistory, nftHistory, tx, events, payloadObj);
      break;
    case MiningContract.SET_ACTIVE:
      // TODO implement action #2535234
      await defaultParseEvents(accountsHistory, nftHistory, tx, events, payloadObj);
      break;
    case MiningContract.CHANGE_NFT_PROPERTY:
      // TODO implement action #3038833
      await defaultParseEvents(accountsHistory, nftHistory, tx, events, payloadObj);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'mining' contract yet.`);
  }
}
module.exports.parseMiningContract = parseMiningContract
