require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodeCleanup = require('node-cleanup');
const config = require('./config');

let client = null;
let db = null;
let accountsHistoryColl = null;
let nftHistoryColl = null;
let marketHistoryColl = null;

const app = express();
app.use(cors({ methods: ['GET'] }));
app.use(bodyParser.json({ type: 'application/json' }));

const historyRouter = express.Router();
const nftHistoryRouter = express.Router();
const marketRouter = express.Router();

const pid = process.env.NODE_APP_INSTANCE;

historyRouter.get('/', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { query } = req;
    const {
      account,
      ops,
      offset,
      limit,
      symbol,
      timestampStart,
      timestampEnd,
      afterID,
    } = query;

    console.log(`[${pid}] got request: ${JSON.stringify(query)} with IP ${ip}`);

    let sOffset = parseInt(offset, 10);
    if (isNaN(sOffset)) { // eslint-disable-line no-restricted-globals
      sOffset = 0;
    }

    let sLimit = parseInt(limit, 10);
    if (isNaN(sLimit)) { // eslint-disable-line no-restricted-globals
      sLimit = 500;
    } else if (sLimit > 500) {
      sLimit = 500;
    } else if (sLimit <= 0) {
      sLimit = 1;
    }

    if (account && account.length >= 3) {
      const accounts = account.split(',');
      const mongoQuery = {
        account: {
          $in: accounts,
        },
      };
      if (ops && ops.length >= 3) {
        const operations = ops.split(',');
        mongoQuery.operation = {
          $in: operations,
        };
      }

      if (symbol && typeof symbol === 'string' && symbol.length > 0 && symbol.length <= 10) {
        mongoQuery.symbol = symbol;
      }

      const sTimestampStart = parseInt(timestampStart, 10);
      const sTimestampEnd = parseInt(timestampEnd, 10);

      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(sTimestampStart) && !isNaN(sTimestampEnd)
        && sTimestampStart <= sTimestampEnd
        && sTimestampStart > 0 && sTimestampStart < Number.MAX_SAFE_INTEGER
        && sTimestampEnd > 0 && sTimestampEnd < Number.MAX_SAFE_INTEGER) {
        mongoQuery.timestamp = {
          $gte: sTimestampStart,
          $lte: sTimestampEnd,
        };
      }

      if (afterID) {
        mongoQuery._id = { $lt: ObjectId(afterID) };
      }

      const result = await accountsHistoryColl.find(mongoQuery, {
        sort: { timestamp: -1, _id: -1 },
        skip: sOffset,
        limit: sLimit,
      }).toArray();

      return res.status(200).json(result);
    }

    return res.status(400).json({
      errors: ['an error occured'],
    });
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return res.status(400).json({
      errors: ['an error occured'],
    });
  }
});

nftHistoryRouter.get('/', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { query } = req;
    const {
      nfts,
      accounts,
      symbol,
      offset,
      limit,
      timestampStart,
      timestampEnd,
      afterID,
    } = query;

    console.log(`[${pid}] got nft request: ${JSON.stringify(query)} with IP ${ip}`);

    let sOffset = parseInt(offset, 10);
    if (isNaN(sOffset)) { // eslint-disable-line no-restricted-globals
      sOffset = 0;
    }

    let sLimit = parseInt(limit, 10);
    if (isNaN(sLimit)) { // eslint-disable-line no-restricted-globals
      sLimit = 500;
    } else if (sLimit > 500) {
      sLimit = 500;
    } else if (sLimit <= 0) {
      sLimit = 1;
    }

    if ((nfts && nfts.length > 0) || (accounts && accounts.length >= 3)) {
      let nftIds = null;
      if (nfts) {
        nftIds = nfts.split(',');
      }

      // match nft ids
      const matchQuery = {};
      if (nftIds) {
        matchQuery.nftId = {
          $in: nftIds,
        };
      }

      // match accounts
      if (accounts && accounts.length > 3) {
        const accountsArray = accounts.split(',');
        matchQuery.account = {
          $in: accountsArray,
        };
      }

      // match symbol
      if (symbol && typeof symbol === 'string' && symbol.length > 0 && symbol.length <= 10) {
        matchQuery.symbol = symbol;
      }

      // match timestamp
      const sTimestampStart = parseInt(timestampStart, 10);
      const sTimestampEnd = parseInt(timestampEnd, 10);
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(sTimestampStart) && !isNaN(sTimestampEnd)
        && sTimestampStart <= sTimestampEnd
        && sTimestampStart > 0 && sTimestampStart < Number.MAX_SAFE_INTEGER
        && sTimestampEnd > 0 && sTimestampEnd < Number.MAX_SAFE_INTEGER) {
        matchQuery.timestamp = {
          $gte: sTimestampStart,
          $lte: sTimestampEnd,
        };
      }

      if (afterID) {
        matchQuery._id = { $lt: ObjectId(afterID) };
      }

      const mongoQuery = [
        {
          $match: matchQuery,
        },
        { $group: { _id: '$accountHistoryId' } },
        {
          $lookup: {
            from: 'accountsHistory',
            localField: '_id',
            foreignField: '_id',
            as: 'fromItems',
          },
        },
        { $match: { fromItems: { $exists: true, $not: { $size: 0 } } } },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [{ $arrayElemAt: ['$fromItems', 0] }, '$$ROOT'],
            },
          },
        },
        {
          $project: {
            fromItems: 0,
          },
        },
        { $sort: { timestamp: -1, _id: -1 } },
        { $skip: sOffset },
        { $limit: sLimit },
      ];

      const result = await nftHistoryColl.aggregate(mongoQuery, {
        allowDiskUse: true,
      }).toArray();

      return res.status(200).json(result);
    }

    return res.status(400).json({
      errors: ['an error occured'],
    });
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return res.status(400).json({
      errors: ['an error occured'],
    });
  }
});

marketRouter.get('/', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { query } = req;
    const {
      symbol,
      timestampStart,
      timestampEnd,
      afterID,
    } = query;

    console.log(`[${pid}] got market request: ${JSON.stringify(query)} with IP ${ip}`);

    if (symbol && typeof symbol === 'string' && symbol.length > 0 && symbol.length <= 10) {
      const mongoQuery = {
        symbol,
      };

      const sTimestampStart = parseInt(timestampStart, 10);
      const sTimestampEnd = parseInt(timestampEnd, 10);

      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(sTimestampStart) && !isNaN(sTimestampEnd)
        && sTimestampStart <= sTimestampEnd
        && sTimestampStart > 0 && sTimestampStart < Number.MAX_SAFE_INTEGER
        && sTimestampEnd > 0 && sTimestampEnd < Number.MAX_SAFE_INTEGER) {
        mongoQuery.timestamp = {
          $gte: sTimestampStart,
          $lte: sTimestampEnd,
        };
      }

      if (afterID) {
        mongoQuery._id = { $lt: ObjectId(afterID) };
      }

      const result = await marketHistoryColl.find(mongoQuery, {
        sort: { timestamp: -1, _id: -1 },
        limit: 500,
      }).toArray();

      return res.status(200).json(result);
    }

    return res.status(400).json({
      errors: ['an error occured'],
    });
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return res.status(400).json({
      errors: ['an error occured'],
    });
  }
});

const init = async () => {
  client = await MongoClient.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
  db = client.db(process.env.DATABASE_NAME);
  db.collection('accountsHistory', { strict: true }, async (err, collection) => {
    // collection does not exist
    if (err) {
      throw new Error('launch history_builder.js first');
    } else {
      accountsHistoryColl = collection;
      nftHistoryColl = db.collection('nftHistory');
      marketHistoryColl = db.collection('marketHistory');
      app.use('/accountHistory', historyRouter);
      app.use('/nftHistory', nftHistoryRouter);
      app.use('/marketHistory', marketRouter);

      app.set('trust proxy', true);
      app.set('trust proxy', 'loopback');

      app.listen(config.port);
    }
  });
};

console.log(`[${pid}] starting up...`);
init();

// graceful app closing
nodeCleanup((exitCode, signal) => { // eslint-disable-line no-unused-vars
  console.log(`[${pid}] shutting down...`);
  client.close();
});
