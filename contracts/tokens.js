/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const {
  insertHistoryForAccounts,
  parseEvents,
} = require('./util');

const {
  TokensContract,
  Contracts,
} = require('../history_builder.constants');


async function parseTransferOperation(collection, tx, logEvent, payloadObj) {
  const insertTx = tx;
  const {
    from,
    to,
    symbol,
    quantity,
  } = logEvent.data;

  const finalFrom = logEvent.event === 'transferFromContract' ? `contract_${from}` : from;
  const finalTo = logEvent.event === 'transferToContract' || logEvent.event === 'issueToContract' ? `contract_${to}` : to;

  insertTx.from = finalFrom;
  insertTx.to = finalTo;
  insertTx.symbol = symbol;
  insertTx.quantity = quantity;
  insertTx.memo = null;
  const { memo } = payloadObj;
  if (memo && typeof memo === 'string') {
    insertTx.memo = memo;
  }

  await insertHistoryForAccounts(collection, insertTx, [finalFrom, finalTo]);
}

async function parseTransferFeeOperation(collection, contract, action, tx, event, payloadObj) {
  if (event.contract === Contracts.TOKENS) {
    const insertTx = {
      ...tx,
    };
    insertTx.operation = `${contract}_transferFee`;
    await parseTransferOperation(collection, insertTx, event, payloadObj);
  }
}

async function parseTransferFeeOperations(collection, contract, action, tx, events, payloadObj) {
  await parseEvents(events, (event) => {
    parseTransferFeeOperation(collection, contract, action, tx, event, payloadObj);
  });
}

async function parseTransferOperations(collection, tx, events, payloadObj) {
  await parseEvents(events, (event) => {
    if (event.contract === Contracts.TOKENS) {
      const insertTx = {
        ...tx,
      };
      parseTransferOperation(collection, insertTx, event, payloadObj);
    }
  });
}


async function parseStakeDelegateOperations(collection, sender, contract, action, tx, events, payloadObj) {
  const insertTx = {
    ...tx,
  };
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
        insertTx.operation = `${contract}_unstakeDone`;
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
  await insertHistoryForAccounts(collection, insertTx, accounts);
}

async function parsePayloadTokensOperation(collection, sender, contract, action, tx, payloadObj) {
  const insertTx = {
    ...tx,
  };
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

  await insertHistoryForAccounts(collection, insertTx, [sender]);
}

async function parseTokensContract(collection, sender, contract, action, tx, events, payloadObj) {
  switch (action) {
    case TokensContract.TRANSFER:
    case TokensContract.TRANSFER_FROM_CONTRACT:
    case TokensContract.TRANSFER_TO_CONTRACT:
    case TokensContract.ISSUE:
      await parseTransferOperations(collection, tx, events, payloadObj);
      break;
    case TokensContract.UPDATE_PRECISION:
    case TokensContract.UPDATE_URL:
    case TokensContract.UPDATE_METADATA:
    case TokensContract.TRANSFER_OWNERSHIP:
    case TokensContract.CREATE:
    case TokensContract.ENABLE_STAKING:
    case TokensContract.UNSTAKE:
    case TokensContract.ENABLE_DELEGATION:
      await parsePayloadTokensOperation(collection, sender, contract, action, tx, payloadObj);
      await parseTransferFeeOperations(collection, contract, action, tx, events, payloadObj);
      break;
    case TokensContract.STAKE:
    case TokensContract.CANCEL_UNSTAKE:
    case TokensContract.DELEGATE:
    case TokensContract.UNDELEGATE:
    case TokensContract.CHECK_PENDING_UNDELEGATIONS:
    case TokensContract.CHECK_PENDING_UNSTAKES:
      await parseStakeDelegateOperations(collection, sender, contract, action, tx, events, payloadObj);
      break;
    case TokensContract.UPDATE_PARAMS:
      // ignore updateParams action
      break;
    default:
      console.log(`Action ${action} is not implemented for 'tokens' contract yet.`);
  }
}

module.exports.parseTokensContract = parseTokensContract;
module.exports.parseTransferOperation = parseTransferOperation;
module.exports.parseTransferOperations = parseTransferOperations;
module.exports.parseTransferFeeOperations = parseTransferFeeOperations;
module.exports.parseTransferFeeOperation = parseTransferFeeOperation;
