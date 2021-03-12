require('dotenv').config();
const { MongoClient } = require('mongodb');
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

      const result = await accountsHistoryColl.find(mongoQuery, {
        limit: sLimit,
        skip: sOffset,
        sort: { timestamp: -1 },
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
        nftIds = nfts.split(',').map(nft => +nft);
      }

      const mongoQuery = [
        {
          $lookup: {
            from: 'accountsHistory',
            localField: 'accountHistoryId',
            foreignField: '_id',
            as: 'fromItems',
          },
        },
        {
          $match: {
            fromItems: {
              $exists: true, $not: { $size: 0 },
            },
          },
        },
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
            nftId: 0,
            accountHistoryId: 0,
          },
        },
      ];

      const innerMatchQuery = [];
      if (nftIds) {
        innerMatchQuery.push({
          nftId: {
            $in: nftIds,
          },
        });
      }

      if (accounts && accounts.length > 3) {
        const accountsArray = accounts.split(',');
        innerMatchQuery.push({
          account: {
            $in: accountsArray,
          },
        });
      }

      if (symbol && typeof symbol === 'string' && symbol.length > 0 && symbol.length <= 10) {
        innerMatchQuery.push({
          symbol,
        });
      }

      const matchQuery = {
        $match: {
          $and: innerMatchQuery,
        },
      };

      mongoQuery.unshift(matchQuery);

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

      const result = await nftHistoryColl.aggregate(mongoQuery, {
        limit: sLimit,
        skip: sOffset,
        sort: { timestamp: -1 },
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
        limit: 500,
        sort: { timestamp: -1 },
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

init();

// graceful app closing
nodeCleanup((exitCode, signal) => { // eslint-disable-line no-unused-vars
  client.close();
});
