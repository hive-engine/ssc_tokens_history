/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const {
  insertHistoryForAccount,
  parseEvents,
  insertHistoryForNft,
} = require('./util');

const {
  parseTransferOperation,
  parseTransferFeeOperation,
} = require('./tokens');

const {
  Contracts,
  NftContract,
  NftMarketContract,
} = require('../history_builder.constants');

const { parseTransferNftOperation } = require('./nft');


async function parseNftEnableMarket(collection, sender, contract, action, tx, events) {
  if (events && events.length > 0) {
    const insertTx = {
      ...tx,
    };

    const {
      symbol,
    } = events[0].data;

    insertTx.symbol = symbol;

    await insertHistoryForAccount(collection, insertTx, sender);
  }
}

async function parseNftChangePrice(collection, nftCollection, sender, contract, action, tx, events) {
  await parseEvents(events, async (event) => {
    const insertTx = {
      ...tx,
    };

    const {
      symbol,
      nftId,
      oldPrice,
      newPrice,
      priceSymbol,
      orderId,
    } = event.data;

    insertTx.nft = nftId;
    insertTx.oldPrice = oldPrice;
    insertTx.newPrice = newPrice;
    insertTx.orderId = orderId;
    insertTx.priceSymbol = priceSymbol;
    insertTx.symbol = symbol;

    await insertHistoryForAccount(collection, insertTx, sender);
    await insertHistoryForNft(nftCollection, nftId, insertTx);
  });
}

async function parseNftBuy(collection, nftCollection, sender, contract, action, tx, events, payloadObj) {
  if (events && events.length > 0) {
    const insertTx = {
      ...tx,
    };
    // fee
    await parseTransferFeeOperation(collection, contract, action, insertTx, events[0], payloadObj);
    // buy price
    insertTx.operation = `${contract}_${action}`;
    await parseTransferOperation(collection, insertTx, events[1], payloadObj);
  }
  await parseEvents(events, async (event) => {
    if (event.contract === Contracts.NFT) {
      if (event.event === NftContract.TRANSFER) {
        const insertTx = {
          ...tx,
        };
        await parseTransferNftOperation(collection, nftCollection, insertTx, event, payloadObj);
      }
    } else if (event.contract === Contracts.NFT_MARKET) {
      if (event.event === NftMarketContract.HIT_SELL_ORDER) {
        const {
          symbol,
          priceSymbol,
          account,
          ownedBy,
          sellers,
          paymentTotal,
          marketAccount,
          feeTotal,
        } = event.data;

        const insertTx = {
          ...tx,
        };
        insertTx.symbol = symbol;
        insertTx.priceSymbol = priceSymbol;
        insertTx.marketAccount = payloadObj.marketAccount ? payloadObj.marketAccount : marketAccount;

        for (let i = 0; i < sellers.length; i += 1) {
          const {
            account: sellerAccount,
            ownedBy: sellerOwnedBy,
            nftIds: sellerNftIds,
            paymentTotal: paymentSeller,
          } = sellers[i];

          const insertTxBuy = {
            ...insertTx,
          };
          insertTxBuy.from = sellerAccount;
          insertTxBuy.nfts = sellerNftIds;
          insertTxBuy.price = paymentSeller;
          insertTxBuy.operation = `${contract}_buy`;

          const insertTxSell = {
            ...insertTx,
          };
          insertTxSell.to = account;
          insertTxSell.nfts = sellerNftIds;
          insertTxSell.price = paymentSeller;
          insertTxSell.operation = `${contract}_sell`;

          await insertHistoryForAccount(collection, insertTxBuy, account);
          await insertHistoryForAccount(collection, insertTxSell, sellerAccount);
          for (let j = 0; j < sellerNftIds.length; j += 1) {
            await insertHistoryForNft(nftCollection, sellerNftIds[j], insertTxSell);
          }
        }
      }
    }
  });
}

async function parseNftSellAndCancel(collection, nftCollection, sender, contract, action, tx, events, payloadObj) {
  await parseEvents(events, async (event) => {
    if (event.contract === Contracts.NFT) {
      if (event.event === NftContract.TRANSFER) {
        await parseTransferNftOperation(collection, nftCollection, tx, event, payloadObj);
      }
    } else if (event.contract === Contracts.NFT_MARKET) {
      if (event.event === NftMarketContract.SELL_ORDER || event.event === NftMarketContract.CANCEL_ORDER) {
        const {
          account,
          ownedBy,
          symbol,
          nftId,
          timestamp,
          price,
          priceSymbol,
          fee,
          orderId,
        } = event.data;

        const insertTx = {
          ...tx,
        };
        insertTx.symbol = symbol;
        insertTx.nft = nftId;
        insertTx.orderTimestamp = timestamp;
        insertTx.price = price;
        insertTx.priceSymbol = priceSymbol;
        insertTx.fee = fee;
        insertTx.orderId = orderId;
        insertTx.operation = `${contract}_${event.event}`;

        await insertHistoryForAccount(collection, insertTx, account);
        await insertHistoryForNft(nftCollection, nftId, insertTx);
      }
    }
  });
}

async function parseNftSetMarketParams(collection, sender, contract, action, tx, events) {
  if (events && events.length > 0) {
    const insertTx = {
      ...tx,
    };

    const {
      symbol,
      officialMarket,
      agentCut,
      minFee,
    } = events[0].data;

    insertTx.officialMarket = officialMarket;
    insertTx.agentCut = agentCut;
    insertTx.minFee = minFee;
    insertTx.symbol = symbol;

    await insertHistoryForAccount(collection, insertTx, sender);
  }
}

async function parseNftMarketContract(collection, nftCollection, sender, contract, action, tx, events, payloadObj) {
  switch (action) {
    case NftMarketContract.SET_MARKET_PARAMS:
      await parseNftSetMarketParams(collection, sender, contract, action, tx, events);
      break;
    case NftMarketContract.ENABLE_MARKET:
      await parseNftEnableMarket(collection, sender, contract, action, tx, events, payloadObj);
      break;
    case NftMarketContract.CANCEL:
    case NftMarketContract.SELL:
      await parseNftSellAndCancel(collection, nftCollection, sender, contract, action, tx, events, payloadObj);
      break;
    case NftMarketContract.BUY:
      await parseNftBuy(collection, nftCollection, sender, contract, action, tx, events, payloadObj);
      break;
    case NftMarketContract.CHANGE_PRICE:
      await parseNftChangePrice(collection, nftCollection, sender, contract, action, tx, events);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'nftmarket' contract yet (${tx.blockNumber}).`);
  }
}

module.exports.parseNftMarketContract = parseNftMarketContract;
