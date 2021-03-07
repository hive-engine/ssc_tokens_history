/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const {
  insertHistoryForAccount,
  insertHistoryForAccounts,
  parseEvents,
} = require('./util');

const { parseTransferOperation } = require('./tokens');

const {
  Contracts,
  NftContract,
  NftMarketContract,
} = require('../history_builder.constants');

const { parseTransferNftOperation } = require('./nft');


async function parseNftChangePrice(collection, sender, contract, action, tx, events) {
  await parseEvents(events, (event) => {
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

    insertTx.id = nftId;
    insertTx.oldPrice = oldPrice;
    insertTx.newPrice = newPrice;
    insertTx.orderId = orderId;
    insertTx.priceSymbol = priceSymbol;
    insertTx.symbol = symbol;

    insertHistoryForAccount(collection, insertTx, sender);
  });
}

async function parseNftBuy(collection, sender, contract, action, tx, events, payloadObj) {
  if (events && events.length > 0) {
    const insertTx = {
      ...tx,
    };
    // fee
    insertTx.operation = `${contract}_${action}Fee`;
    await parseTransferOperation(collection, insertTx, events[0], payloadObj);
    // buy price
    insertTx.operation = `${contract}_${action}`;
    await parseTransferOperation(collection, insertTx, events[1], payloadObj);
  }
  await parseEvents(events, (event) => {
    if (event.contract === Contracts.NFT) {
      if (event.event === NftContract.TRANSFER) {
        const insertTx = {
          ...tx,
        };
        parseTransferNftOperation(collection, insertTx, event, payloadObj);
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

          insertHistoryForAccount(collection, insertTxBuy, account);
          insertHistoryForAccount(collection, insertTxSell, sellerAccount);
        }
      }
    }
  });
}

async function parseNftSellAndCancel(collection, sender, contract, action, tx, events, payloadObj) {
  await parseEvents(events, (event) => {
    if (event.contract === Contracts.NFT) {
      if (event.event === NftContract.TRANSFER) {
        parseTransferNftOperation(collection, tx, event, payloadObj);
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
        insertTx.id = nftId;
        insertTx.orderTimestamp = timestamp;
        insertTx.price = price;
        insertTx.priceSymbol = priceSymbol;
        insertTx.fee = fee;
        insertTx.orderId = orderId;
        insertTx.operation = `${contract}_${event.event}`;

        insertHistoryForAccount(collection, insertTx, account);
      }
    }
  });
}

async function parseNftMarketContract(collection, sender, contract, action, tx, events, payloadObj) {
  switch (action) {
    // case NftMarketContract.SET_MARKET_PARAMS:
    // case NftMarketContract.ENABLE_MARKET:
    case NftMarketContract.CANCEL:
    case NftMarketContract.SELL:
      await parseNftSellAndCancel(collection, sender, contract, action, tx, events, payloadObj);
      break;
    case NftMarketContract.BUY:
      await parseNftBuy(collection, sender, contract, action, tx, events, payloadObj);
      break;
    case NftMarketContract.CHANGE_PRICE:
      await parseNftChangePrice(collection, sender, contract, action, tx, events);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'nftmarket' contract yet (${tx.blockNumber}).`);
  }
}

module.exports.parseNftMarketContract = parseNftMarketContract;
