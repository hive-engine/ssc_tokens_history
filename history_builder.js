/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
require('dotenv').config();
const { MongoClient } = require('mongodb');
const nodeCleanup = require('node-cleanup');
const fs = require('fs-extra');
const BigNumber = require('bignumber.js');
const SSC = require('sscjs');
const { Queue } = require('./libs/Queue');
const config = require('./config');

const sscNodes = new Queue();
config.nodes.forEach(node => sscNodes.push(node));

const getSSCNode = () => {
  const node = sscNodes.pop();
  sscNodes.push(node);

  console.log('Using SSC node:', node); // eslint-disable-line no-console
  return node;
};

let ssc = new SSC(getSSCNode());
let client = null;
let db = null;
let accountsHistoryColl = null;
let marketHistoryColl = null;

let { lastSSCBlockParsed } = config; // eslint-disable-line prefer-const

async function parseBlock(block) {
  const {
    transactions,
    virtualTransactions,
    timestamp,
    blockNumber,
  } = block;

  console.log(`parsing block #${blockNumber}`); // eslint-disable-line no-console

  const nbTxs = transactions.length;
  const blockDate = new Date(`${timestamp}.000Z`);
  const stringDate = `${blockDate.getFullYear()}-${(blockDate.getMonth() + 1).toString().padStart(2, '0')}-${(blockDate.getDate()).toString().padStart(2, '0')}`;
  const dateTimestamp = new Date(stringDate).getTime() / 1000;
  const finalTimestamp = blockDate.getTime() / 1000;

  for (let index = 0; index < nbTxs; index += 1) {
    const tx = transactions[index];

    const {
      sender,
      contract,
      action,
      transactionId,
      payload,
      logs,
    } = tx;

    let finalTx = {
      blockNumber,
      transactionId,
      timestamp: finalTimestamp,
    };

    const logsObj = JSON.parse(logs);
    const payloadObj = JSON.parse(payload);
    const { events, errors } = logsObj;

    if (contract === 'tokens' || contract === 'hivepegged' || contract === 'witnesses') {
      const transerOperations = ['transfer', 'issue', 'transferToContract', 'transferFromContract', 'buy', 'withdraw', 'proposeRound'];
      if (errors === undefined
        && transerOperations.includes(action)
        && events && events.length > 0) {
        const nbEvents = events.length;
        for (let idx = 0; idx < nbEvents; idx += 1) {
          const {
            from,
            to,
            symbol,
            quantity,
          } = events[idx].data;

          const finalFrom = action === 'issue' || action === 'transferFromContract' ? `contract_${from}` : from;
          const finalTo = action === 'transferToContract' ? `contract_${to}` : to;
          finalTx.account = finalFrom;
          finalTx.operation = `${contract}_${action}`;
          finalTx.from = finalFrom;
          finalTx.to = finalTo;
          finalTx.symbol = symbol;
          finalTx.quantity = quantity;
          finalTx.memo = null;
          const { memo } = payloadObj;
          if (memo && typeof memo === 'string') {
            finalTx.memo = memo;
          }

          await accountsHistoryColl.insertOne(finalTx);
          finalTx._id = null;
          finalTx.account = finalTo;

          await accountsHistoryColl.insertOne(finalTx);
          finalTx._id = null;
        }
      } else if (errors === undefined && action === 'updatePrecision') {
        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}`;
        finalTx.symbol = payloadObj.symbol;
        finalTx.newPrecision = payloadObj.precision;
        await accountsHistoryColl.insertOne(finalTx);
      } else if (errors === undefined && action === 'updateUrl') {
        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}`;
        finalTx.symbol = payloadObj.symbol;
        finalTx.newUrl = payloadObj.url;
        await accountsHistoryColl.insertOne(finalTx);
      } else if (errors === undefined && action === 'updateMetadata') {
        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}`;
        finalTx.symbol = payloadObj.symbol;
        finalTx.newMetadata = JSON.stringify(payloadObj.metadata);
        await accountsHistoryColl.insertOne(finalTx);
      } else if (errors === undefined && action === 'transferOwnership') {
        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}`;
        finalTx.symbol = payloadObj.symbol;
        finalTx.newOwner = payloadObj.to;
        await accountsHistoryColl.insertOne(finalTx);
      } else if (errors === undefined && action === 'create') {
        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}`;
        finalTx.name = payloadObj.name;
        finalTx.symbol = payloadObj.symbol;
        finalTx.url = payloadObj.url;
        finalTx.precision = payloadObj.precision;
        finalTx.maxSupply = payloadObj.maxSupply;
        await accountsHistoryColl.insertOne(finalTx);
      } else if (errors === undefined && action === 'enableStaking') {
        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}`;
        finalTx.symbol = payloadObj.symbol;
        finalTx.unstakingCooldown = payloadObj.unstakingCooldown;
        finalTx.numberTransactions = payloadObj.numberTransactions;
        await accountsHistoryColl.insertOne(finalTx);
      } else if (errors === undefined
        && action === 'stake'
        && events && events.length > 0) {
        const {
          account,
          symbol,
          quantity,
        } = events[0].data;
        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}`;
        finalTx.symbol = symbol;
        finalTx.from = sender;
        finalTx.to = account;
        finalTx.quantity = quantity;
        await accountsHistoryColl.insertOne(finalTx);

        if (sender !== account) {
          finalTx._id = null;
          finalTx.account = account;
          await accountsHistoryColl.insertOne(finalTx);
        }
      } else if (errors === undefined && action === 'unstake') {
        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}Start`;
        finalTx.symbol = payloadObj.symbol;
        finalTx.quantity = payloadObj.quantity;
        await accountsHistoryColl.insertOne(finalTx);
      } else if (errors === undefined
        && action === 'cancelUnstake'
        && events && events.length > 0) {
        const {
          symbol,
          quantity,
        } = events[0].data;

        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}`;
        finalTx.unstakeTxID = payloadObj.txID;
        finalTx.symbol = symbol;
        finalTx.quantityReturned = quantity;
        await accountsHistoryColl.insertOne(finalTx);
      } else if (errors === undefined && action === 'enableDelegation') {
        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}`;
        finalTx.symbol = payloadObj.symbol;
        finalTx.undelegationCooldown = payloadObj.undelegationCooldown;
        await accountsHistoryColl.insertOne(finalTx);
      } else if (errors === undefined
        && action === 'delegate'
        && events && events.length > 0) {
        const {
          to,
          symbol,
          quantity,
        } = events[0].data;
        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}`;
        finalTx.symbol = symbol;
        finalTx.from = sender;
        finalTx.to = to;
        finalTx.quantity = quantity;
        await accountsHistoryColl.insertOne(finalTx);

        finalTx._id = null;
        finalTx.account = to;
        await accountsHistoryColl.insertOne(finalTx);
      } else if (errors === undefined
        && action === 'undelegate'
        && events && events.length > 0) {
        const {
          from,
          symbol,
          quantity,
        } = events[0].data;
        finalTx.account = sender;
        finalTx.operation = `${contract}_${action}Start`;
        finalTx.symbol = symbol;
        finalTx.from = from;
        finalTx.to = sender;
        finalTx.quantity = quantity;
        await accountsHistoryColl.insertOne(finalTx);

        finalTx._id = null;
        finalTx.account = from;
        await accountsHistoryColl.insertOne(finalTx);
      }
    } else if (contract === 'market') {
      if (errors === undefined
        && action === 'cancel'
        && events && events.length > 0) {
        const {
          to,
          symbol,
          quantity,
        } = events[0].data;

        finalTx.account = to;
        finalTx.operation = `${contract}_${action}`;
        finalTx.orderType = payloadObj.type;
        finalTx.orderID = payloadObj.id;
        finalTx.symbol = symbol;
        finalTx.quantityReturned = quantity;
        await accountsHistoryColl.insertOne(finalTx);

        // TODO: get the initial tx and get the price set or this order to update market metrics
      } else if (errors === undefined
        && (action === 'buy' || action === 'marketBuy')
        && events && events.length > 0) {
        // the first event holds the data regarding the order that has been placed
        const nbEvents = events.length;
        const {
          quantity,
        } = events[0].data;
        // eslint-disable-next-line prefer-destructuring
        const symbol = payloadObj.symbol;
        finalTx.account = sender;
        finalTx.operation = `${contract}_placeOrder`;
        finalTx.orderType = action;
        finalTx.price = payloadObj.price;
        finalTx.symbol = symbol;
        finalTx.quantityLocked = quantity;
        await accountsHistoryColl.insertOne(finalTx);

        if (nbEvents > 1) {
          // the following events are potentially expired orders
          let startIndex = 1;

          for (let idx = startIndex; idx < nbEvents; idx += 1) {
            finalTx = {
              blockNumber,
              transactionId,
              timestamp: finalTimestamp,
            };
            const event = events[idx];
            let nextEvent = null;
            if (idx + 1 < nbEvents) {
              nextEvent = events[idx + 1];
            }

            // if the next event is a SWAP.HIVE transfer
            // then the current event is an order being filled
            // so the expired orders have been processed
            if (nextEvent && nextEvent.data.symbol === 'SWAP.HIVE') {
              startIndex = idx;
              break;
            }

            if (nextEvent && nextEvent.event === 'orderExpired') {
              finalTx.account = event.data.to;
              finalTx.operation = `${contract}_expire`;
              finalTx.orderId = nextEvent.data.txId;
              finalTx.orderType = 'sell';
              finalTx.symbol = symbol;
              finalTx.quantityUnlocked = event.data.quantity;
              await accountsHistoryColl.insertOne(finalTx);
              startIndex = idx + 1;
            }
          }

          // the following events are related to the order being filled
          for (let idx = startIndex; idx < nbEvents; idx += 1) {
            finalTx = {
              blockNumber,
              transactionId,
              timestamp: finalTimestamp,
            };
            const event = events[idx];
            let nextEvent = null;
            if (idx + 1 < nbEvents) {
              nextEvent = events[idx + 1];
            }

            // if the event is a symbol transfer
            // and the next event is a SWAP.HIVE transfer
            // and the to is the sender
            if (event.data.to === sender
              && event.data.symbol === symbol
              && nextEvent && nextEvent.data.to !== sender
              && nextEvent.data.symbol === 'SWAP.HIVE') {
              // buy event
              finalTx.account = event.data.to;
              finalTx.operation = `${contract}_buy`;
              finalTx.from = nextEvent.data.to;
              finalTx.symbol = symbol;
              finalTx.quantityTokens = event.data.quantity;
              finalTx.quantitySteem = nextEvent.data.quantity;
              await accountsHistoryColl.insertOne(finalTx);

              // sell event
              finalTx = {
                blockNumber,
                transactionId,
                timestamp: finalTimestamp,
              };
              finalTx.account = nextEvent.data.to;
              finalTx.operation = `${contract}_sell`;
              finalTx.to = event.data.to;
              finalTx.symbol = symbol;
              finalTx.quantityTokens = event.data.quantity;
              finalTx.quantitySteem = nextEvent.data.quantity;
              await accountsHistoryColl.insertOne(finalTx);

              let metric = await marketHistoryColl.findOne({ timestamp: dateTimestamp, symbol });
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

                await marketHistoryColl.insertOne(metric);
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

                await marketHistoryColl.updateOne({ _id: metric._id }, { $set: metric });
              }

              idx += 1;
            } else if (event.event === 'orderClosed') {
              // market order closed
              finalTx.account = event.data.account;
              finalTx.operation = `${contract}_closeOrder`;
              finalTx.orderID = event.data.txId;
              finalTx.orderType = event.data.type;
              await accountsHistoryColl.insertOne(finalTx);
            }
          }
        }
      } else if (errors === undefined
        && (action === 'sell' || action === 'marketSell')
        && events && events.length > 0) {
        // the first event holds the data regarding the order that has been placed
        const nbEvents = events.length;
        const {
          quantity,
        } = events[0].data;
        // eslint-disable-next-line prefer-destructuring
        const symbol = payloadObj.symbol;
        finalTx.account = sender;
        finalTx.operation = `${contract}_placeOrder`;
        finalTx.orderType = action;
        finalTx.price = payloadObj.price;
        finalTx.symbol = symbol;
        finalTx.quantityLocked = quantity;
        await accountsHistoryColl.insertOne(finalTx);

        if (nbEvents > 1) {
          // the following events are potentially expired orders
          let startIndex = 1;

          for (let idx = startIndex; idx < nbEvents; idx += 1) {
            finalTx = {
              blockNumber,
              transactionId,
              timestamp: finalTimestamp,
            };
            const event = events[idx];
            let nextEvent = null;
            if (idx + 1 < nbEvents) {
              nextEvent = events[idx + 1];
            }

            if (event.data.symbol === symbol) {
              startIndex = idx;
              break;
            }

            if (nextEvent && nextEvent.event === 'orderExpired') {
              finalTx.account = event.data.to;
              finalTx.operation = `${contract}_expire`;
              finalTx.orderId = nextEvent.data.txId;
              finalTx.orderType = 'buy';
              finalTx.symbol = event.data.symbol;
              finalTx.quantityUnlocked = event.data.quantity;
              await accountsHistoryColl.insertOne(finalTx);
            }
          }

          // the following events are related to the order being filled
          for (let idx = startIndex; idx < nbEvents; idx += 1) {
            finalTx = {
              blockNumber,
              transactionId,
              timestamp: finalTimestamp,
            };
            const event = events[idx];
            let nextEvent = null;
            if (idx + 1 < nbEvents) {
              nextEvent = events[idx + 1];
            }

            // if the event is a symbol transfer
            // and the next event is a SWAP.HIVE transfer
            // and the next event to is the sender
            if (event.data.to !== sender
              && event.data.symbol === symbol
              && nextEvent && nextEvent.data.to === sender
              && nextEvent.data.symbol === 'SWAP.HIVE') {
              // buy event
              finalTx.account = event.data.to;
              finalTx.operation = `${contract}_buy`;
              finalTx.from = nextEvent.data.to;
              finalTx.symbol = symbol;
              finalTx.quantityTokens = event.data.quantity;
              finalTx.quantitySteem = nextEvent.data.quantity;
              await accountsHistoryColl.insertOne(finalTx);

              // sell event
              finalTx = {
                blockNumber,
                transactionId,
                timestamp: finalTimestamp,
              };
              finalTx.account = nextEvent.data.to;
              finalTx.operation = `${contract}_sell`;
              finalTx.to = event.data.to;
              finalTx.symbol = symbol;
              finalTx.quantityTokens = event.data.quantity;
              finalTx.quantitySteem = nextEvent.data.quantity;
              await accountsHistoryColl.insertOne(finalTx);

              let metric = await marketHistoryColl.findOne({ timestamp: dateTimestamp, symbol });
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

                await marketHistoryColl.insertOne(metric);
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

                await marketHistoryColl.updateOne({ _id: metric._id }, { $set: metric });
              }

              idx += 1;
            } else if (event.event === 'orderClosed') {
              // market order closed
              finalTx.account = event.data.account;
              finalTx.operation = `${contract}_closeOrder`;
              finalTx.orderID = event.data.txId;
              finalTx.orderType = event.data.type;
              await accountsHistoryColl.insertOne(finalTx);
            }
          }
        }
      }
    }
  }

  const nbVirtualTxs = virtualTransactions.length;
  for (let index = 0; index < nbVirtualTxs; index += 1) {
    const tx = virtualTransactions[index];

    const {
      contract,
      action,
      transactionId,
      logs,
    } = tx;

    const finalTx = {
      blockNumber,
      transactionId,
      timestamp: finalTimestamp,
    };

    const logsObj = JSON.parse(logs);
    const { events, errors } = logsObj;

    if (contract === 'tokens') {
      if (errors === undefined
        && action === 'checkPendingUnstakes'
        && events && events.length > 0) {
        const {
          account,
          symbol,
          quantity,
        } = events[0].data;

        finalTx.account = account;
        finalTx.operation = `${contract}_unstake`;
        finalTx.symbol = symbol;
        finalTx.quantity = quantity;

        await accountsHistoryColl.insertOne(finalTx);
      } else if (errors === undefined
        && action === 'checkPendingUndelegations'
        && events && events.length > 0) {
        const {
          account,
          symbol,
          quantity,
        } = events[0].data;

        finalTx.account = account;
        finalTx.operation = `${contract}_undelegateDone`;
        finalTx.symbol = symbol;
        finalTx.quantity = quantity;

        await accountsHistoryColl.insertOne(finalTx);
      }
    } else if (contract === 'mining') {
      if (errors === undefined
            && action === 'checkPendingLotteries'
            && events && events.length > 1) {
        const {
          poolId,
          winners,
        } = events[0].data;
        const {
          symbol,
        } = events[1].data;
        for (let i = 0; i < winners.length; i += 1) {
          finalTx.poolId = poolId;
          finalTx.account = winners[i].winner;
          finalTx.symbol = symbol;
          finalTx.quantity = winners[i].winningAmount;
          finalTx.operation = 'mining_lottery';
          finalTx._id = null;
          await accountsHistoryColl.insertOne(finalTx);
        }
      }
    }
    /* else if (contract === 'nft') {
      if (errors === undefined
        && action === 'checkPendingUndelegations'
        && events && events.length > 0) {
        const {
          symbol,
          ids,
        } = events[0].data;

        finalTx.account = account;
        finalTx.operation = `${contract}_undelegateDone`;
        finalTx.symbol = symbol;
        finalTx.ids = ids;

        await accountsHistoryColl.insertOne(finalTx);
      }
    } */
  }

  lastSSCBlockParsed = block.blockNumber;
}

async function parseSSCChain(blockNumber) {
  try {
    const block = await ssc.getBlockInfo(blockNumber);

    if (block !== null) {
      await parseBlock(block);

      parseSSCChain(blockNumber + 1);
    } else {
      setTimeout(() => parseSSCChain(blockNumber), config.pollingTime);
    }
  } catch (error) {
    console.log(error);
    ssc = new SSC(getSSCNode());
    setTimeout(() => parseSSCChain(blockNumber), config.pollingTime);
  }
}

const init = async () => {
  client = await MongoClient.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
  db = client.db(process.env.DATABASE_NAME);
  db.collection('accountsHistory', { strict: true }, async (err, collection) => {
    // collection does not exist
    if (err) {
      console.log('creating collections');
      accountsHistoryColl = await db.createCollection('accountsHistory');
      await accountsHistoryColl.createIndex({ account: 1, symbol: 1, timestamp: -1 });
      await accountsHistoryColl.createIndex({ transactionId: 1 });
      marketHistoryColl = await db.createCollection('marketHistory');
      await marketHistoryColl.createIndex({ symbol: 1, timestamp: -1 });
    } else {
      accountsHistoryColl = collection;
      marketHistoryColl = db.collection('marketHistory');
    }

    parseSSCChain(lastSSCBlockParsed);
  });
};

init();

// graceful app closing
nodeCleanup((exitCode, signal) => { // eslint-disable-line no-unused-vars
  client.close();
  console.log('start saving conf'); // eslint-disable-line no-console
  const conf = fs.readJSONSync('./config.json');
  conf.lastSSCBlockParsed = lastSSCBlockParsed + 1;
  fs.writeJSONSync('./config.json', conf, { spaces: 4 });
  console.log('done saving conf'); // eslint-disable-line no-console
});
