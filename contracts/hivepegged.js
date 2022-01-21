/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const {
  parseTransferOperations,
} = require('./tokens');
const { defaultParseEvents } = require('./default');

const { HivePeggedContract } = require('../history_builder.constants');


async function parseHivePeggedContract(accountsHistory, nftHistory, action, tx, events, payloadObj) {
  switch (action) {
    case HivePeggedContract.BUY:
    case HivePeggedContract.WITHDRAW:
      await parseTransferOperations(accountsHistory, tx, events, payloadObj);
      break;
    case HivePeggedContract.REMOVE_WITHDRAWAL:
      // TODO implement action
      await defaultParseEvents(accountsHistory, nftHistory, tx, events, payloadObj);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'hivepegged' contract yet.`);
  }
}

module.exports.parseHivePeggedContract = parseHivePeggedContract;
