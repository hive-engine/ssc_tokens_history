/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */

const {
  Contracts,
  TokensContract,
} = require('../history_builder.constants');
const { parseTransferOperation } = require('./tokens');

async function parseCommentsContract(accountsHistory, sender, contract, action, tx, events, payloadObj) {
  if (!events) {
    return;
  }
  for (let i = 0; i < events.length; i += 1) {
    const evt = events[i];
    if (evt.contract === Contracts.TOKENS && evt.event !== TokensContract.ISSUE_TO_CONTRACT) {
      await parseTransferOperation(accountsHistory, tx, evt, payloadObj);
    } else if (evt.data.authorperm) {
      tx.authorperm = evt.data.authorperm;
      tx.operation = 'comments_' + evt.event;
    }
  }
}

module.exports.parseCommentsContract = parseCommentsContract;
