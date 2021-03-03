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

const Contracts = {
  TOKENS: 'tokens',
  MARKET: 'market',
  MARKET_POOLS: 'marketpools',
  NFT: 'nft',
  NFT_MARKET: 'nftmarket',
  WITNESSES: 'witnesses',
  HIVE_PEGGED: 'hivepegged',
  MINING: 'mining',
  BOT_CONTROLLER: 'botcontroller',
};

const TokensContract = {
  TRANSFER: 'transfer',
  TRANSFER_FROM_CONTRACT: 'transferFromContract',
  TRANSFER_TO_CONTRACT: 'transferToContract',
  ISSUE: 'issue',
  UPDATE_PRECISION: 'updatePrecision',
  UPDATE_URL: 'updateUrl',
  UPDATE_METADATA: 'updateMetadata',
  TRANSFER_OWNERSHIP: 'transferOwnership',
  CREATE: 'create',
  ENABLE_STAKING: 'enableStaking',
  STAKE: 'stake',
  UNSTAKE: 'unstake',
  CANCEL_UNSTAKE: 'cancelUnstake',
  ENABLE_DELEGATION: 'enableDelegation',
  DELEGATE: 'delegate',
  UNDELEGATE: 'undelegate',
};

const WitnessesContract = {
  PROPOSE_ROUND: 'proposeRound',
  REGISTER: 'register',
  APPROVE: 'approve',
  DISAPPROVE: 'disapprove',
};

const HivePeggedContract = {
  BUY: 'buy',
  WITHDRAW: 'withdraw',
  REMOVE_WITHDRAWAL: 'removeWithdrawal',
};

const NftContract = {
  ISSUE: 'issue',
  ISSUE_MULTIPLE: 'issueMultiple',
  DELEGATE: 'delegate',
  TRANSFER: 'transfer',
  BURN: 'burn',
  SET_PROPERTIES: 'setProperties',
  CREATE: 'create',
  ADD_PROPERTY: 'addProperty',
  UPDATE_URL: 'updateUrl',
  UPDATE_METADATA: 'updateMetadata',
  UPDATE_NAME: 'updateName',
  UPDATE_ORG_NAME: 'updateOrgName',
  UPDATE_PRODUCT_NAME: 'updateProductName',
};

async function insertHistoryForAccounts(tx, accounts) {
  const insertTx = tx;
  const inserted = [];
  for (let i = 0; i < accounts.length; i += 1) {
    const account = accounts[i];
    if (!inserted.includes(account)) {
      inserted.push(account);

      insertTx._id = null;
      insertTx.account = account;
      await accountsHistoryColl.insertOne(insertTx);
    }
  }
}

async function parseTransferOperation(tx, logEvent, payloadObj) {
  const insertTx = tx;
  const {
    from,
    to,
    symbol,
    quantity,
  } = logEvent.data;

  const finalFrom = logEvent.event === 'transferFromContract' ? `contract_${from}` : from;
  const finalTo = logEvent.event === 'transferToContract' ? `contract_${to}` : to;

  insertTx.from = finalFrom;
  insertTx.to = finalTo;
  insertTx.symbol = symbol;
  insertTx.quantity = quantity;
  insertTx.memo = null;
  const { memo } = payloadObj;
  if (memo && typeof memo === 'string') {
    insertTx.memo = memo;
  }

  await insertHistoryForAccounts(insertTx, [finalFrom, finalTo]);
}

async function parseTransferOperations(tx, events, payloadObj) {
  if (events) {
    for (let idx = 0; idx < events.length; idx += 1) {
      const logEvent = events[idx];
      if (logEvent.contract === Contracts.TOKENS) {
        await parseTransferOperation(tx, logEvent, payloadObj);
      }
    }
  }
}

async function parseStakeDelegateOperations(sender, contract, action, tx, events, payloadObj) {
  const insertTx = tx;
  const accounts = [sender];
  if (events && events.length > 0) {
    const logEvent = events[0].data;
    insertTx.symbol = logEvent.symbol;

    switch (action) {
      case TokensContract.STAKE:
        insertTx.from = sender;
        insertTx.to = logEvent.account;
        insertTx.quantity = logEvent.quantity;
        accounts.push(logEvent.account);
        break;
      case TokensContract.CANCEL_UNSTAKE:
        insertTx.unstakeTxID = payloadObj.txID;
        insertTx.quantityReturned = logEvent.quantity;
        break;
      case TokensContract.DELEGATE:
        insertTx.from = sender;
        insertTx.to = logEvent.to;
        insertTx.quantity = logEvent.quantity;
        accounts.push(logEvent.to);
        break;
      case TokensContract.UNDELEGATE:
        insertTx.operation = `${contract}_${action}Start`;
        insertTx.from = logEvent.from;
        insertTx.to = sender;
        insertTx.quantity = logEvent.quantity;
        accounts.push(logEvent.from);
        break;
      default:
        break;
    }
  }
  await insertHistoryForAccounts(insertTx, accounts);
}

async function parsePayloadTokensOperation(sender, contract, action, tx, payloadObj) {
  const insertTx = tx;
  insertTx.symbol = payloadObj.symbol;

  // additional stuff
  switch (action) {
    case TokensContract.UPDATE_PRECISION:
      insertTx.newPrecision = payloadObj.precision;
      break;
    case TokensContract.UPDATE_URL:
      insertTx.newUrl = payloadObj.url;
      break;
    case TokensContract.UPDATE_METADATA:
      insertTx.newMetadata = JSON.stringify(payloadObj.metadata);
      break;
    case TokensContract.TRANSFER_OWNERSHIP:
      insertTx.newOwner = payloadObj.to;
      break;
    case TokensContract.CREATE:
      insertTx.name = payloadObj.name;
      insertTx.url = payloadObj.url;
      insertTx.precision = payloadObj.precision;
      insertTx.maxSupply = payloadObj.maxSupply;
      break;
    case TokensContract.ENABLE_STAKING:
      insertTx.unstakingCooldown = payloadObj.unstakingCooldown;
      insertTx.numberTransactions = payloadObj.numberTransactions;
      break;
    case TokensContract.UNSTAKE:
      insertTx.operation = `${contract}_${action}Start`;
      insertTx.quantity = payloadObj.quantity;
      break;
    case TokensContract.ENABLE_DELEGATION:
      insertTx.undelegationCooldown = payloadObj.undelegationCooldown;
      break;
    default:
      break;
  }

  await insertHistoryForAccounts(insertTx, [sender]);
}

async function parseTokensContract(sender, contract, action, tx, events, payloadObj) {
  switch (action) {
    case TokensContract.TRANSFER:
    case TokensContract.TRANSFER_FROM_CONTRACT:
    case TokensContract.TRANSFER_TO_CONTRACT:
    case TokensContract.ISSUE:
      await parseTransferOperations(tx, events, payloadObj);
      break;
    case TokensContract.UPDATE_PRECISION:
    case TokensContract.UPDATE_URL:
    case TokensContract.UPDATE_METADATA:
    case TokensContract.TRANSFER_OWNERSHIP:
    case TokensContract.CREATE:
    case TokensContract.ENABLE_STAKING:
    case TokensContract.UNSTAKE:
    case TokensContract.ENABLE_DELEGATION:
      await parsePayloadTokensOperation(sender, contract, action, tx, payloadObj);
      break;
    case TokensContract.STAKE:
    case TokensContract.CANCEL_UNSTAKE:
    case TokensContract.DELEGATE:
    case TokensContract.UNDELEGATE:
      await parseStakeDelegateOperations(sender, contract, action, tx, events, payloadObj);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'tokens' contract yet.`);
  }
}

async function parseWitnessesContract(action, tx, events, payloadObj) {
  switch (action) {
    case WitnessesContract.PROPOSE_ROUND:
      await parseTransferOperations(tx, events, payloadObj);
      break;
    case WitnessesContract.REGISTER:
    case WitnessesContract.APPROVE:
    case WitnessesContract.DISAPPROVE:
      // TODO implement actions
      break;
    default:
      console.log(`Action ${action} is not implemented for 'witnesses' contract yet.`);
  }
}

async function parseHivePeggedContract(action, tx, events, payloadObj) {
  switch (action) {
    case HivePeggedContract.BUY:
    case HivePeggedContract.WITHDRAW:
      await parseTransferOperations(tx, events, payloadObj);
      break;
    case HivePeggedContract.REMOVE_WITHDRAWAL:
      // TODO implement action
      break;
    default:
      console.log(`Action ${action} is not implemented for 'hivepegged' contract yet.`);
  }
}

async function parseTransferNftOperation(tx, logEvent, payloadObj) {
  const insertTx = tx;
  const {
    from,
    fromType,
    to,
    toType,
    symbol,
    id,
  } = logEvent.data;

  const finalFrom = fromType === 'user' || fromType === 'u' ? from : `contract_${from}`;
  const finalTo = toType === 'user' || toType === 'u' ? to : `contract_${to}`;

  insertTx.from = finalFrom;
  insertTx.to = finalTo;
  insertTx.symbol = symbol;
  insertTx.id = id;
  insertTx.memo = null;
  const { memo } = payloadObj;
  if (memo && typeof memo === 'string') {
    insertTx.memo = memo;
  }

  await insertHistoryForAccounts(insertTx, [finalFrom, finalTo]);
}

async function parseTransferNftOperations(tx, events, payloadObj) {
  const insertTx = tx;
  if (events) {
    for (let idx = 0; idx < events.length; idx += 1) {
      const logEvent = events[idx];
      if (logEvent.contract === Contracts.NFT) {
        if (logEvent.event === NftContract.ISSUE) {
          insertTx.lockedTokens = logEvent.data.lockedTokens;
          insertTx.lockedNfts = logEvent.data.lockedNfts;
          insertTx.properties = logEvent.data.properties;
        } else if (logEvent.event === NftContract.BURN) {
          insertTx.unlockedTokens = logEvent.data.unlockedTokens;
          insertTx.unlockedNfts = logEvent.data.unlockedNfts;

          logEvent.data.from = logEvent.data.account;
          logEvent.data.fromType = logEvent.data.ownedBy;
          logEvent.data.to = 'null';
          logEvent.data.toType = 'u';
        }
        await parseTransferNftOperation(insertTx, logEvent, payloadObj);
      }
    }
  }
}

async function parsePayloadNftOperation(sender, contract, action, tx, payloadObj) {
  const insertTx = tx;
  insertTx.symbol = payloadObj.symbol;

  // additional stuff
  switch (action) {
    case NftContract.SET_PROPERTIES:
      insertTx.nfts = payloadObj.nfts;
      break;
    case NftContract.ADD_PROPERTY:
      insertTx.name = payloadObj.name;
      insertTx.type = payloadObj.type;
      break;
    case NftContract.CREATE:
      insertTx.name = payloadObj.name;
      insertTx.orgName = payloadObj.orgName;
      insertTx.productName = payloadObj.productName;
      insertTx.url = payloadObj.url;
      break;
    case NftContract.UPDATE_URL:
      insertTx.url = payloadObj.url;
      break;
    case NftContract.UPDATE_METADATA:
      insertTx.metadata = payloadObj.metadata;
      break;
    case NftContract.UPDATE_NAME:
      insertTx.name = payloadObj.name;
      break;
    case NftContract.UPDATE_ORG_NAME:
      insertTx.orgName = payloadObj.orgName;
      break;
    case NftContract.UPDATE_PRODUCT_NAME:
      insertTx.productName = payloadObj.productName;
      break;
    default:
      break;
  }

  await insertHistoryForAccounts(insertTx, [sender]);
}

async function parseNftContract(sender, contract, action, tx, events, payloadObj) {
  switch (action) {
    case NftContract.TRANSFER:
    case NftContract.DELEGATE:
      await parseTransferNftOperations(tx, events, payloadObj);
      break;
    case NftContract.ISSUE:
    case NftContract.ISSUE_MULTIPLE:
      await parseTransferOperations(tx, events, payloadObj);
      await parseTransferNftOperations(tx, events, payloadObj);
      break;
    case NftContract.BURN:
      await parseTransferOperations(tx, events, payloadObj);
      await parseTransferNftOperations(tx, events, payloadObj);
      break;
    case NftContract.SET_PROPERTIES:
      await parsePayloadNftOperation(sender, contract, action, tx, payloadObj);
      break;
    case NftContract.CREATE:
    case NftContract.ADD_PROPERTY:
      await parseTransferOperations(tx, events, payloadObj);
      await parsePayloadNftOperation(sender, contract, action, tx, payloadObj);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'nft' contract yet.`);
  }
}

async function parseTx(tx, blockNumber, dateTimestamp, finalTimestamp) {
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
    operation: `${contract}_${action}`,
  };

  const logsObj = JSON.parse(logs);
  const payloadObj = JSON.parse(payload);
  const { events, errors } = logsObj;

  if (errors === undefined) {
    switch (contract) {
      case Contracts.TOKENS:
        await parseTokensContract(sender, contract, action, finalTx, events, payloadObj);
        break;
      case Contracts.MARKET:
        break;
      case Contracts.NFT:
        await parseNftContract(sender, contract, action, finalTx, events, payloadObj);
        break;
      case Contracts.WITNESSES:
        await parseWitnessesContract(action, finalTx, events, payloadObj);
        break;
      case Contracts.HIVE_PEGGED:
        await parseHivePeggedContract(action, finalTx, events, payloadObj);
        break;
      case Contracts.NFT_MARKET:
        // TODO implement contract
        break;
      case Contracts.MINING:
        // TODO implement contract
        break;
      case Contracts.BOT_CONTROLLER:
        // TODO implement contract
        break;
      case Contracts.MARKET_POOLS:
        // TODO implement contract
        break;
      default:
        console.log(`Contract ${contract} is not implemented yet.`);
    }
  } else {
    // an error occurred -> no need to process the transaction
  }

  if (contract === 'market') {
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

async function parseVirtualTx(tx, blockNumber, finalTimestamp) {
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

async function parseBlock(block) {
  const {
    transactions,
    virtualTransactions,
    timestamp,
    blockNumber,
  } = block;

  console.log(`parsing block #${blockNumber}`); // eslint-disable-line no-console

  const blockDate = new Date(`${timestamp}.000Z`);
  const stringDate = `${blockDate.getFullYear()}-${(blockDate.getMonth() + 1).toString().padStart(2, '0')}-${(blockDate.getDate()).toString().padStart(2, '0')}`;
  const dateTimestamp = new Date(stringDate).getTime() / 1000;
  const finalTimestamp = blockDate.getTime() / 1000;

  for (let index = 0; index < transactions.length; index += 1) {
    const tx = transactions[index];
    await parseTx(tx, blockNumber, dateTimestamp, finalTimestamp);
  }

  for (let index = 0; index < virtualTransactions.length; index += 1) {
    const tx = virtualTransactions[index];
    await parseVirtualTx(tx, blockNumber, finalTimestamp);
  }

  lastSSCBlockParsed = blockNumber;
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
