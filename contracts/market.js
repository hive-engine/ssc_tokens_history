/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const BigNumber = require('bignumber.js');

const {
  insertHistoryForAccount,
  parseEvents,
} = require('./util');


const { parseTransferOperation } = require('./tokens');

const {
  MarketContract,
  TokensContract,
} = require('../history_builder.constants');

const HIVEPEGGED_SYMBOL = 'SWAP.HIVE';

async function insertMarketHistory(collection, dateTimestamp, symbol, event, nextEvent) {
  let metric = await collection.findOne({ timestamp: dateTimestamp, symbol });
  const price = BigNumber(nextEvent.data.quantity)
    .dividedBy(event.data.quantity)
    .toFixed(8);
  if (metric === null) {
    metric = {
      timestamp: dateTimestamp,
      symbol,
      volumeSteem: nextEvent.data.quantity,
      volumeToken: event.data.quantity,
      lowestPrice: price,
      highestPrice: price,
      openPrice: price,
      closePrice: price,
    };

    await collection.insertOne(metric);
  } else {
    metric.volumeSteem = BigNumber(metric.volumeSteem)
      .plus(nextEvent.data.quantity)
      .toFixed(8);

    const dp = BigNumber(metric.volumeToken).dp();
    const dp2 = BigNumber(event.data.quantity).dp();
    const finalDp = dp >= dp2 ? dp : dp2;
    metric.volumeToken = BigNumber(metric.volumeToken)
      .plus(event.data.quantity)
      .toFixed(finalDp);

    metric.lowestPrice = BigNumber(metric.lowestPrice).gt(price)
      ? price
      : metric.lowestPrice;

    metric.highestPrice = BigNumber(metric.highestPrice).lt(price)
      ? price
      : metric.highestPrice;

    metric.closePrice = price;

    await collection.updateOne({ _id: metric._id }, { $set: metric });
  }
}

async function parseMarketTransferOperations(collection, marketCollection, sender, contract, action, tx, events, payloadObj, dateTimestamp) {
  let firstTransferIndex = -1;
  await parseEvents(events, (event, idx) => {
    const insertTx = {
      ...tx,
    };
    let eventSender = sender;
    insertTx.symbol = event.data.symbol;
    if (action === MarketContract.CANCEL) {
      eventSender = event.data.to;
      insertTx.orderType = payloadObj.type;
      insertTx.orderID = payloadObj.id;
      insertTx.quantityReturned = event.data.quantity;

      // TODO: get the initial tx and get the price set or this order to update market metrics
    } else if (action === MarketContract.BUY || action === MarketContract.MARKET_BUY || action === MarketContract.SELL || action === MarketContract.MARKET_SELL) {
      if (event.event === TokensContract.TRANSFER_TO_CONTRACT) {
        insertTx.operation = `${contract}_placeOrder`;
        insertTx.orderType = action;
        insertTx.price = payloadObj.price;
        insertTx.quantityLocked = event.data.quantity;
      } else if (event.event === MarketContract.ORDER_EXPIRED) {
        // ignore this event
      } else if (event.event === TokensContract.TRANSFER_FROM_CONTRACT) {
        eventSender = event.data.to;
        if (idx + 1 < events.length && events[idx + 1].event === MarketContract.ORDER_EXPIRED) {
          insertTx.operation = `${contract}_expire`;
          insertTx.orderId = events[idx + 1].data.txId;
          if (action === MarketContract.BUY || action === MarketContract.MARKET_BUY) {
            insertTx.orderType = 'sell';
          } else {
            insertTx.orderType = 'buy';
          }
          insertTx.quantityUnlocked = event.data.quantity;
        } else {
          if (firstTransferIndex === -1) {
            firstTransferIndex = idx;
          }

          if ((idx - firstTransferIndex) % 2 === 0) {
            // handle transfer of remaining quantity
            if (event.data.symbol === events[idx - 1].data.symbol && (event.event === events[idx - 1].event || idx + 1 >= events.length)) {
              if (action === MarketContract.BUY || action === MarketContract.MARKET_BUY) {
                insertTx.operation = `${contract}_buyRemaining`;
              } else {
                insertTx.operation = `${contract}_sellRemaining`;
              }
              parseTransferOperation(collection, tx, event, payloadObj);

              firstTransferIndex = idx + 1;
            } else {
              insertTx.operation = `${contract}_buy`;
              insertTx.from = events[idx + 1].data.to;
              insertTx.quantityTokens = event.data.quantity;
              insertTx.quantitySteem = events[idx + 1].data.quantity;

              insertMarketHistory(marketCollection, dateTimestamp, event.data.symbol, event, events[idx + 1]);
            }
          } else {
            insertTx.operation = `${contract}_sell`;
            insertTx.to = events[idx - 1].data.to;
            insertTx.quantityTokens = events[idx - 1].data.quantity;
            insertTx.quantitySteem = event.data.quantity;
            insertTx.symbol = events[idx - 1].data.symbol;
          }
        }
      } else if (event.event === MarketContract.ORDER_CLOSED) {
        eventSender = event.data.account;
        insertTx.operation = `${contract}_closeOrder`;
        insertTx.orderID = event.data.txId;
        insertTx.orderType = event.data.type;
      }
    }
    insertHistoryForAccount(collection, insertTx, eventSender);
  });
}

async function parseMarketContract(collection, marketCollection, sender, contract, action, tx, events, payloadObj, dateTimestamp) {
  switch (action) {
    case MarketContract.CANCEL:
    case MarketContract.BUY:
    case MarketContract.MARKET_BUY:
    case MarketContract.SELL:
    case MarketContract.MARKET_SELL:
      await parseMarketTransferOperations(collection, marketCollection, sender, contract, action, tx, events, payloadObj, dateTimestamp);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'market' contract yet.`);
  }
}

module.exports.parseMarketContract = parseMarketContract;
