/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const {
  parseTransferOperations,
} = require('./util');

const { HivePeggedContract } = require('../history_builder.constants');


async function parseHivePeggedContract(collection, action, tx, events, payloadObj) {
  switch (action) {
    case HivePeggedContract.BUY:
    case HivePeggedContract.WITHDRAW:
      await parseTransferOperations(collection, tx, events, payloadObj);
      break;
    case HivePeggedContract.REMOVE_WITHDRAWAL:
      // TODO implement action
      break;
    default:
      console.log(`Action ${action} is not implemented for 'hivepegged' contract yet.`);
  }
}

module.exports.parseHivePeggedContract = parseHivePeggedContract;
