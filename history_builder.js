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
  INFLATION: 'inflation',
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
  CHECK_PENDING_UNSTAKES: 'checkPendingUnstakes',
  CHECK_PENDING_UNDELEGATIONS: 'checkPendingUndelegations',
};

const WitnessesContract = {
  PROPOSE_ROUND: 'proposeRound',
  REGISTER: 'register',
  APPROVE: 'approve',
  DISAPPROVE: 'disapprove',
  SCHEDULE_WITNESSES: 'scheduleWitnesses',
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

const MarketContract = {
  CANCEL: 'cancel',
  BUY: 'buy',
  MARKET_BUY: 'marketBuy',
  SELL: 'sell',
  MARKET_SELL: 'marketSell',
  ORDER_CLOSED: 'orderClosed',
  ORDER_EXPIRED: 'orderExpired',
};

const MiningContract = {
  CHECK_PENDING_LOTTERIES: 'checkPendingLotteries',
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
  let accounts = [sender];
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
      case TokensContract.CHECK_PENDING_UNSTAKES:
        accounts = [logEvent.account];
        insertTx.operation = `${contract}_unstake`;
        insertTx.quantity = logEvent.quantity;
        break;
      case TokensContract.CHECK_PENDING_UNDELEGATIONS:
        accounts = [logEvent.account];
        insertTx.operation = `${contract}_undelegateDone`;
        insertTx.quantity = logEvent.quantity;
        break;
      default:
        return;
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
      return;
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
    case TokensContract.CHECK_PENDING_UNDELEGATIONS:
    case TokensContract.CHECK_PENDING_UNSTAKES:
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
    case WitnessesContract.SCHEDULE_WITNESSES:
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
  if (events) {
    for (let idx = 0; idx < events.length; idx += 1) {
      const insertTx = {
        ...tx,
      };
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
      return;
  }

  await insertHistoryForAccounts(insertTx, [sender]);
}

async function parseNftContract(sender, contract, action, tx, events, payloadObj) {
  switch (action) {
    case NftContract.TRANSFER:
    case NftContract.DELEGATE:
    case NftContract.ISSUE:
    case NftContract.ISSUE_MULTIPLE:
    case NftContract.BURN:
      await parseTransferOperations(tx, events, payloadObj);
      await parseTransferNftOperations(tx, events, payloadObj);
      break;
    case NftContract.SET_PROPERTIES:
    case NftContract.CREATE:
    case NftContract.ADD_PROPERTY:
    case NftContract.UPDATE_URL:
    case NftContract.UPDATE_METADATA:
    case NftContract.UPDATE_NAME:
    case NftContract.UPDATE_ORG_NAME:
    case NftContract.UPDATE_PRODUCT_NAME:
      await parseTransferOperations(tx, events, payloadObj);
      await parsePayloadNftOperation(sender, contract, action, tx, payloadObj);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'nft' contract yet.`);
  }

  // TODO virtual tx for nft contract
  // if (contract === 'nft') {
  //   if (errors === undefined
  //     && action === 'checkPendingUndelegations'
  //     && events && events.length > 0) {
  //     const {
  //       symbol,
  //       ids,
  //     } = events[0].data;
  //
  //     finalTx.account = account;
  //     finalTx.operation = `${contract}_undelegateDone`;
  //     finalTx.symbol = symbol;
  //     finalTx.ids = ids;
  //
  //     await accountsHistoryColl.insertOne(finalTx);
  //   }
  // }
}

async function insertMarketHistory(dateTimestamp, symbol, event, nextEvent) {
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
}

async function parseMarketTransferOperations(sender, contract, action, tx, events, payloadObj, dateTimestamp) {
  let firstTransferIndex = -1;
  if (events) {
    for (let idx = 0; idx < events.length; idx += 1) {
      const insertTx = {
        ...tx,
      };
      const logEvent = events[idx];
      let eventSender = sender;
      insertTx.symbol = logEvent.data.symbol;
      if (action === MarketContract.CANCEL) {
        eventSender = logEvent.data.to;
        insertTx.orderType = payloadObj.type;
        insertTx.orderID = payloadObj.id;
        insertTx.quantityReturned = logEvent.data.quantity;

        // TODO: get the initial tx and get the price set or this order to update market metrics
      } else if (action === MarketContract.BUY || action === MarketContract.MARKET_BUY || action === MarketContract.SELL || action === MarketContract.MARKET_SELL) {
        if (logEvent.event === TokensContract.TRANSFER_TO_CONTRACT) {
          insertTx.operation = `${contract}_placeOrder`;
          insertTx.orderType = action;
          insertTx.price = payloadObj.price;
          insertTx.quantityLocked = logEvent.data.quantity;
        } else if (logEvent.event === MarketContract.ORDER_EXPIRED) {
          // ignore this event
        } else if (logEvent.event === TokensContract.TRANSFER_FROM_CONTRACT) {
          eventSender = logEvent.data.to;
          if (idx + 1 < events.length && events[idx + 1].event === MarketContract.ORDER_EXPIRED) {
            insertTx.operation = `${contract}_expire`;
            insertTx.orderId = events[idx + 1].data.txId;
            if (action === MarketContract.BUY || action === MarketContract.MARKET_BUY) {
              insertTx.orderType = 'sell';
            } else {
              insertTx.orderType = 'buy';
            }
            insertTx.quantityUnlocked = logEvent.data.quantity;
          } else {
            if (firstTransferIndex === -1) {
              firstTransferIndex = idx;
            }

            if ((idx - firstTransferIndex) % 2 === 0) {
              insertTx.operation = `${contract}_buy`;
              insertTx.from = events[idx + 1].data.to;
              insertTx.quantityTokens = logEvent.data.quantity;
              insertTx.quantitySteem = events[idx + 1].data.quantity;

              await insertMarketHistory(dateTimestamp, logEvent.data.symbol, logEvent, events[idx + 1]);
            } else {
              insertTx.operation = `${contract}_sell`;
              insertTx.to = events[idx - 1].data.to;
              insertTx.quantityTokens = events[idx - 1].data.quantity;
              insertTx.quantitySteem = logEvent.data.quantity;
              insertTx.symbol = events[idx - 1].data.symbol;
            }
          }
        } else if (logEvent.event === MarketContract.ORDER_CLOSED) {
          eventSender = logEvent.data.account;
          insertTx.operation = `${contract}_closeOrder`;
          insertTx.orderID = logEvent.data.txId;
          insertTx.orderType = logEvent.data.type;
        }
      }
      await insertHistoryForAccounts(insertTx, [eventSender]);
    }
  }
}

async function parseMarketContract(sender, contract, action, tx, events, payloadObj, dateTimestamp) {
  switch (action) {
    case MarketContract.CANCEL:
    case MarketContract.BUY:
    case MarketContract.MARKET_BUY:
    case MarketContract.SELL:
    case MarketContract.MARKET_SELL:
      await parseMarketTransferOperations(sender, contract, action, tx, events, payloadObj, dateTimestamp);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'market' contract yet.`);
  }
}

async function parseLotteryOperation(sender, contract, action, tx, events) {
  const insertTx = tx;

  if (events && events.length > 1) {
    const {
      poolId,
      winners,
    } = events[0].data;
    const {
      symbol,
    } = events[1].data;
    for (let i = 0; i < winners.length; i += 1) {
      insertTx.poolId = poolId;
      insertTx.symbol = symbol;
      insertTx.quantity = winners[i].winningAmount;
      insertTx.operation = `${contract}_lottery`;
      await insertHistoryForAccounts(insertTx, [winners[i].winner]);
    }
  }
}

async function parseMiningContract(sender, contract, action, tx, events) {
  switch (action) {
    case MiningContract.CHECK_PENDING_LOTTERIES:
      await parseLotteryOperation(sender, contract, action, tx, events);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'mining' contract yet.`);
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

  const finalTx = {
    blockNumber,
    transactionId,
    timestamp: finalTimestamp,
    operation: `${contract}_${action}`,
  };

  const logsObj = JSON.parse(logs);
  let payloadObj = null;
  if (payload) {
    payloadObj = JSON.parse(payload);
  }
  const { events, errors } = logsObj;

  if (errors === undefined) {
    switch (contract) {
      case Contracts.TOKENS:
        await parseTokensContract(sender, contract, action, finalTx, events, payloadObj);
        break;
      case Contracts.MARKET:
        // await parseMarketContract(sender, contract, action, finalTx, events, payloadObj, dateTimestamp);
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
        await parseMiningContract(sender, contract, action, finalTx, events);
        break;
      case Contracts.BOT_CONTROLLER:
        // TODO implement contract
        break;
      case Contracts.MARKET_POOLS:
        // TODO implement contract
        break;
      case Contracts.INFLATION:
        // TODO implement contract
        break;
      default:
        console.log(`Contract ${contract} is not implemented yet.`);
    }
  } else {
    // an error occurred -> no need to process the transaction
  }
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

  const allTransactions = transactions.concat(virtualTransactions);
  for (let index = 0; index < allTransactions.length; index += 1) {
    const tx = allTransactions[index];
    await parseTx(tx, blockNumber, dateTimestamp, finalTimestamp);
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
