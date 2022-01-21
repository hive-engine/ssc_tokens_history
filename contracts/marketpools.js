/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */

const { defaultParseEvents } = require('./default');

async function parseMarketPoolsContract(accountsHistory, nftHistory, sender, contract, action, finalTx, events, payloadObj) {
  // TODO implement contract
  // console.log(`Action ${action} is not implemented for 'marketpools' contract yet.`);
  await defaultParseEvents(accountsHistory, nftHistory, finalTx, events, payloadObj);
}

module.exports.parseMarketPoolsContract = parseMarketPoolsContract;
