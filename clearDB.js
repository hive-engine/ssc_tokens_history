require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  const query = `
  -- Table: transactions

  delete from transactions;
`;

  await pool.query(query);

  pool.end();
}

initDB();
