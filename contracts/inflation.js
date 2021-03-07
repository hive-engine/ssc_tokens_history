/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const {
  parseTransferOperations,
} = require('./util');

const { InflationContract } = require('../history_builder.constants');


async function parseInflationContract(collection, sender, contract, action, tx, events, payloadObj) {
  switch (action) {
    case InflationContract.ISSUE_NEW_TOKENS:
      await parseTransferOperations(collection, tx, events, payloadObj);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'inflation' contract yet.`);
  }
}

module.exports.parseInflationContract = parseInflationContract;
