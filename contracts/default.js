const {
  Contracts,
  NftContract,
  TokensContract,
} = require('../history_builder.constants');
const { parseTransferNftOperation  } = require('./nft');
const { parseTransferOperation } = require('./tokens');

async function defaultParseEvents(accountsHistory, nftHistory, finalTx, events, payloadObj) {
  if (events) {
    const tokensEvents = events.filter(evt => evt.contract === Contracts.TOKENS && [TokensContract.TRANSFER, TokensContract.STAKE, TokensContract.TRANSFER_FROM_CONTRACT, TokensContract.STAKE_FROM_CONTRACT].findIndex(x => x === evt.event) >= 0);
    for (let i = 0; i < tokensEvents.length; i += 1) {
      const evt = tokensEvents[i];
      await parseTransferOperation(accountsHistory, finalTx, evt, payloadObj);
    }
    const nftEvents = events.filter(evt => evt.contract === Contracts.NFT && [NftContract.TRANSFER, NftContract.ISSUE].findIndex(x => x === evt.event) >= 0);
    for (let i = 0; i < nftEvents.length; i += 1) {
      const evt = nftEvents[i];
      await parseTransferNftOperation(accountsHistory, nftHistory, finalTx, evt, payloadObj);
    }
  }
}

module.exports.defaultParseEvents = defaultParseEvents;
