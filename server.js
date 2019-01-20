require('dotenv').config();
const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodeCleanup = require('node-cleanup');
const config = require('./config');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(cors({ methods: ['GET'] }));
app.use(bodyParser.json({ type: 'application/json' }));

const historyRouter = express.Router();

historyRouter.get('/', async (req, res) => {
  try {
    const { query } = req;
    const {
      account,
      offset,
      limit,
      type,
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

    const sType = type !== 'user' && type !== 'contract' ? 'user' : type;

    const SQLQuery = `
      SELECT *
      FROM "transactions"
      WHERE 
        ("from" = $1 AND "from_type" = $2) OR
        ("to" = $1 AND "to_type" = $2)
      ORDER BY "timestamp" DESC
      OFFSET $3
      LIMIT $4`;

    const { rows } = await pool.query(SQLQuery, [account, sType, sOffset, sLimit]);
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return res.status(400).json({
      errors: ['an error occured'],
    });
  }
});

app.use('/history', historyRouter);

app.set('trust proxy', true);
app.set('trust proxy', 'loopback');

app.listen(config.port);

// graceful app closing
nodeCleanup((exitCode, signal) => { // eslint-disable-line no-unused-vars
  pool.end();
});
