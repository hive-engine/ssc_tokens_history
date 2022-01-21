/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const {
  parseTransferOperations,
} = require('./tokens');
const { defaultParseEvents } = require('./default');

const { WitnessesContract } = require('../history_builder.constants');


async function parseWitnessesContract(accountsHistory, nftHistory, action, tx, events, payloadObj) {
  switch (action) {
    case WitnessesContract.PROPOSE_ROUND:
      await parseTransferOperations(accountsHistory, tx, events, payloadObj);
      break;
    case WitnessesContract.REGISTER:
    case WitnessesContract.APPROVE:
    case WitnessesContract.DISAPPROVE:
    case WitnessesContract.SCHEDULE_WITNESSES:
      // TODO implement actions
      await defaultParseEvents(accountsHistory, nftHistory, tx, events, payloadObj);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'witnesses' contract yet.`);
  }
}

module.exports.parseWitnessesContract = parseWitnessesContract;
