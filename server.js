require('dotenv').config();
const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
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

const validatorMiddleware = (req, res, next) => {
  const { query } = req;
  const {
    offset,
    limit,
  } = query;

  let sOffset = parseInt(offset, 10);
  if (isNaN(sOffset)) { // eslint-disable-line no-restricted-globals
    sOffset = 0;
  } else if (sOffset > config.serverOptions.maxOffset) {
    res.status(400).json({
      errors: [`offset is too high, maximum offset is ${config.serverOptions.maxOffset}`],
    });
    return;
  } else if (sOffset <= 0) {
    sOffset = 0;
  }
  query.offset = sOffset;

  let sLimit = parseInt(limit, 10);
  if (isNaN(sLimit)) { // eslint-disable-line no-restricted-globals
    sLimit = config.serverOptions.maxLimit;
  } else if (sLimit > config.serverOptions.maxLimit) {
    res.status(400).json({
      errors: [`limit is too high, maximum limit is ${config.serverOptions.maxLimit}`],
    });
    return;
  } else if (sLimit <= 0) {
    sLimit = 1;
  }
  query.limit = sLimit;
  next();
};

historyRouter.get('/', async (req, res) => {
  try {
    const { query } = req;
    const {
      account,
      ops,
      offset,
      limit,
      symbol,
      timestampStart,
      timestampEnd,
    } = query;

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

      const result = await accountsHistoryColl.find(mongoQuery, {
        sort: { timestamp: -1 },
        skip: offset,
        limit,
      }).toArray();

      return res.status(200).json(result);
    }

    return res.status(400).json({
      errors: ['an error occurred'],
    });
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return res.status(400).json({
      errors: ['an error occurred'],
    });
  }
});

nftHistoryRouter.get('/', async (req, res) => {
  try {
    const { query } = req;
    const {
      nfts,
      accounts,
      symbol,
      offset,
      limit,
      timestampStart,
      timestampEnd,
    } = query;

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
        { $sort: { timestamp: -1 } },
        { $skip: offset },
        { $limit: limit },
      ];

      const result = await nftHistoryColl.aggregate(mongoQuery, {
        allowDiskUse: true,
      }).toArray();

      return res.status(200).json(result);
    }

    return res.status(400).json({
      errors: ['an error occurred'],
    });
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return res.status(400).json({
      errors: ['an error occurred'],
    });
  }
});

marketRouter.get('/', async (req, res) => {
  try {
    const { query } = req;
    const {
      symbol,
      timestampStart,
      timestampEnd,
    } = query;

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

      const result = await marketHistoryColl.find(mongoQuery, {
        sort: { timestamp: -1 },
        limit: 500,
      }).toArray();

      return res.status(200).json(result);
    }

    return res.status(400).json({
      errors: ['an error occurred'],
    });
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return res.status(400).json({
      errors: ['an error occurred'],
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
      if (config.serverOptions.logRequests) {
        morgan.token('ip', req => req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress);
        morgan.token('query', req => JSON.stringify(req.query));
        app.use(morgan(':method | :status | :url | :ip | :response-time ms | :query'));
      }
      app.use('*', validatorMiddleware);
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
