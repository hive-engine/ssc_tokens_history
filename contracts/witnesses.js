/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const {
  parseTransferOperations,
} = require('./util');

const { WitnessesContract } = require('../history_builder.constants');


async function parseWitnessesContract(collection, action, tx, events, payloadObj) {
  switch (action) {
    case WitnessesContract.PROPOSE_ROUND:
      await parseTransferOperations(collection, tx, events, payloadObj);
      break;
    case WitnessesContract.REGISTER:
    case WitnessesContract.APPROVE:
    case WitnessesContract.DISAPPROVE:
    case WitnessesContract.SCHEDULE_WITNESSES:
      // TODO implement actions
      break;
    default:
      console.log(`Action ${action} is not implemented for 'witnesses' contract yet.`);
  }
}

module.exports.parseWitnessesContract = parseWitnessesContract;
