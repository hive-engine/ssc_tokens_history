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
} = require('../history_builder.constants');


async function parseTransferNftOperation(collection, tx, logEvent) {
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

  await insertHistoryForAccounts(collection, insertTx, [finalFrom, finalTo]);
}

async function parseTransferNftOperations(collection, tx, events) {
  await parseEvents(events, (e) => {
    const event = e;
    const insertTx = {
      ...tx,
    };
    if (event.contract === Contracts.NFT) {
      if (event.event === NftContract.ISSUE) {
        insertTx.lockedTokens = event.data.lockedTokens;
        insertTx.lockedNfts = event.data.lockedNfts;
        insertTx.properties = event.data.properties;
      } else if (event.event === NftContract.BURN) {
        insertTx.unlockedTokens = event.data.unlockedTokens;
        insertTx.unlockedNfts = event.data.unlockedNfts;

        event.data.from = event.data.account;
        event.data.fromType = event.data.ownedBy;
        event.data.to = 'null';
        event.data.toType = 'u';
      }
      parseTransferNftOperation(collection, insertTx, event);
    }
  });
}

async function parsePayloadNftOperation(collection, sender, contract, action, tx, payloadObj) {
  const insertTx = {
    ...tx,
  };
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
    case NftContract.ADD_AUTHORIZED_ISSUING_ACCOUNTS:
      insertTx.accounts = payloadObj.accounts;
      break;
    case NftContract.SET_PROPERTY_PERMISSIONS:
      insertTx.accounts = payloadObj.accounts;
      insertTx.name = payloadObj.name;
      break;
    case NftContract.ENABLE_DELEGATION:
      insertTx.undelegationCooldown = payloadObj.undelegationCooldown;
      break;
    case NftContract.SET_GROUP_BY:
      insertTx.properties = payloadObj.properties;
      break;
    default:
      return;
  }

  await insertHistoryForAccounts(collection, insertTx, [sender]);
}

async function parseNftUpdatePropertyDefinition(collection, sender, tx, events) {
  const txNft = {
    ...tx,
  };
  const {
    symbol,
    originalName,
    originalType,
    originalIsReadOnly,
    newName,
    newType,
    newIsReadOnly,
  } = events[0].data;

  txNft.symbol = symbol;
  txNft.originalName = originalName;
  txNft.originalType = originalType;
  txNft.originalIsReadOnly = originalIsReadOnly;
  txNft.newName = newName;
  txNft.newType = newType;
  txNft.newIsReadOnly = newIsReadOnly;

  await insertHistoryForAccount(collection, txNft, sender);
}

async function parseNftUndelegate(collection, sender, contract, action, tx, events) {
  // #2869599
  await parseEvents(events, (event) => {
    if (event.event === NftContract.UNDELEGATE_START) {
      const txNft = {
        ...tx,
      };

      const {
        from,
        fromType,
        symbol,
        id,
      } = event.data;

      const finalFrom = fromType === 'user' || fromType === 'u' ? from : `contract_${from}`;

      txNft.symbol = symbol;
      txNft.from = finalFrom;
      txNft.id = id;

      insertHistoryForAccount(collection, txNft, sender);
    }
  });
}

async function parseNftCheckPendingUndelegations(collection, sender, contract, action, tx, events) {
  // #2886309
  await parseEvents(events, (event) => {
    if (event.event === NftContract.UNDELEGATE_DONE) {
      const txNft = {
        ...tx,
      };

      const {
        symbol,
        ids,
      } = event.data;

      txNft.symbol = symbol;
      txNft.ids = ids;
      txNft.operation = `${contract}_undelegateDone`;

      insertHistoryForAccount(collection, txNft, sender);
    }
  });
}

async function parseNftTransferFee(collection, sender, contract, action, tx, events, payloadObj) {
  await parseEvents(events, (event) => {
    if (event.contract === Contracts.TOKENS) {
      const insertTx = {
        ...tx,
      };
      insertTx.operation = `${contract}_${action}Fee`;
      parseTransferOperation(collection, insertTx, event, payloadObj);
    }
  });
}

async function parseNftContract(collection, sender, contract, action, tx, events, payloadObj) {
  switch (action) {
    case NftContract.TRANSFER:
    case NftContract.DELEGATE:
    case NftContract.ISSUE:
    case NftContract.ISSUE_MULTIPLE:
    case NftContract.BURN:
      await parseNftTransferFee(collection, sender, contract, action, tx, events, payloadObj);
      await parseTransferNftOperations(collection, tx, events);
      break;
    case NftContract.SET_PROPERTIES:
    case NftContract.CREATE:
    case NftContract.ADD_PROPERTY:
    case NftContract.UPDATE_URL:
    case NftContract.UPDATE_METADATA:
    case NftContract.UPDATE_NAME:
    case NftContract.UPDATE_ORG_NAME:
    case NftContract.UPDATE_PRODUCT_NAME:
    case NftContract.ADD_AUTHORIZED_ISSUING_ACCOUNTS:
    case NftContract.SET_PROPERTY_PERMISSIONS:
    case NftContract.ENABLE_DELEGATION:
    case NftContract.SET_GROUP_BY:
      await parseNftTransferFee(collection, sender, contract, action, tx, events, payloadObj);
      await parsePayloadNftOperation(collection, sender, contract, action, tx, payloadObj);
      break;
    case NftContract.UPDATE_PROPERTY_DEFINITION:
      await parseNftUpdatePropertyDefinition(collection, sender, tx, events);
      break;
    case NftContract.UNDELEGATE:
      await parseNftUndelegate(collection, sender, contract, action, tx, events);
      break;
    case NftContract.CHECK_PENDING_UNDELEGATIONS:
      await parseNftCheckPendingUndelegations(collection, sender, contract, action, tx, events);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'nft' contract yet.`);
  }
}

module.exports.parseNftContract = parseNftContract;
module.exports.parseTransferNftOperation = parseTransferNftOperation;
