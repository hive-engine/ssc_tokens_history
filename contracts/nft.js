/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
const {
  insertHistoryForAccount,
  insertHistoryForAccounts,
  insertHistoryForNft,
  parseEvents,
} = require('./util');

const { parseTransferFeeOperations } = require('./tokens');

const {
  Contracts,
  NftContract,
} = require('../history_builder.constants');


async function parseTransferNftOperation(collection, nftCollection, tx, logEvent) {
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
  insertTx.nft = id;

  await insertHistoryForAccount(collection, insertTx, finalFrom);
  await insertHistoryForNft(nftCollection, id, insertTx);

  // quick fix until account history is restructured to two separate collections that only
  // reference the collection by id similary as for the nftHistory
  insertTx.account = finalTo;
  await insertHistoryForNft(nftCollection, id, insertTx);
  if (finalFrom !== finalTo) {
    await insertHistoryForAccount(collection, insertTx, finalTo);
  }
}

async function parseTransferNftOperations(collection, nftCollection, tx, events) {
  await parseEvents(events, async (e) => {
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
      await parseTransferNftOperation(collection, nftCollection, insertTx, event);
    }
  });
}

async function parsePayloadNftOperation(collection, nftCollection, sender, contract, action, tx, payloadObj) {
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
  if (action === NftContract.SET_PROPERTIES) {
    for (let i = 0; i < insertTx.nfts.length; i += 1) {
      await insertHistoryForNft(nftCollection, insertTx.nfts[i], insertTx);
    }
  }
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

async function parseNftUndelegate(collection, nftCollection, sender, contract, action, tx, events) {
  await parseEvents(events, async (event) => {
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
      txNft.nft = id;

      await insertHistoryForAccount(collection, txNft, sender);
      await insertHistoryForNft(nftCollection, id, txNft);
    }
  });
}

async function parseNftCheckPendingUndelegations(collection, nftCollection, sender, contract, action, tx, events) {
  await parseEvents(events, async (event) => {
    if (event.event === NftContract.UNDELEGATE_DONE) {
      const txNft = {
        ...tx,
      };

      const {
        symbol,
        ids,
      } = event.data;

      txNft.symbol = symbol;
      txNft.nfts = ids;
      txNft.operation = `${contract}_undelegateDone`;

      await insertHistoryForAccount(collection, txNft, sender);
      for (let i = 0; i < ids.length; i += 1) {
        await insertHistoryForNft(nftCollection, ids[i], txNft);
      }
    }
  });
}

async function parseNftContract(collection, nftCollection, sender, contract, action, tx, events, payloadObj) {
  switch (action) {
    case NftContract.TRANSFER:
    case NftContract.DELEGATE:
    case NftContract.ISSUE:
    case NftContract.ISSUE_MULTIPLE:
    case NftContract.BURN:
      await parseTransferFeeOperations(collection, sender, contract, action, tx, events, payloadObj);
      await parseTransferNftOperations(collection, nftCollection, tx, events);
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
      await parseTransferFeeOperations(collection, sender, contract, action, tx, events, payloadObj);
      await parsePayloadNftOperation(collection, nftCollection, sender, contract, action, tx, payloadObj);
      break;
    case NftContract.UPDATE_PROPERTY_DEFINITION:
      await parseNftUpdatePropertyDefinition(collection, sender, tx, events);
      break;
    case NftContract.UNDELEGATE:
      await parseNftUndelegate(collection, nftCollection, sender, contract, action, tx, events);
      break;
    case NftContract.CHECK_PENDING_UNDELEGATIONS:
      await parseNftCheckPendingUndelegations(collection, nftCollection, sender, contract, action, tx, events);
      break;
    default:
      console.log(`Action ${action} is not implemented for 'nft' contract yet.`);
  }
}

module.exports.parseNftContract = parseNftContract;
module.exports.parseTransferNftOperation = parseTransferNftOperation;
