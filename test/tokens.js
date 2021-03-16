/* eslint-disable */
const assert = require('assert');
const { MongoClient } = require('mongodb');
const SSC = require('sscjs');


const conf = {
  databaseURL: "mongodb://localhost:27017",
  databaseName: "hsc_history",
  node: "http://localhost:5000",
};

let ssc = new SSC(conf.node);


describe('tokens', function () {
  this.timeout(60000);

  before((done) => {
    new Promise(async (resolve) => {
      client = await MongoClient.connect(conf.databaseURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      db = await client.db(conf.databaseName);
      resolve();
    })
      .then(() => {
        done()
      })
  });

  after((done) => {
    new Promise(async (resolve) => {
      await client.close();
      resolve();
    })
      .then(() => {
        done()
      })
  });

  beforeEach((done) => {
    new Promise(async (resolve) => {
      db = await client.db(conf.databaseName);
      accountsHistory = await db.collection('accountsHistory');
      nftHistory = await db.collection('nftHistory');
      marketHistory = await db.collection('marketHistory');
      resolve();
    })
      .then(() => {
        done()
      })
  });

  afterEach((done) => {
    // runs after each test in this block
    new Promise(async (resolve) => {
      resolve();
    })
      .then(() => {
        done()
      })
  });

  async function parseBlockAndFind(blockNumber) {
    return accountsHistory.find({ blockNumber: blockNumber })
      .toArray();
  }

  it('parse tokens_transfer', (done) => {
    new Promise(async (resolve) => {
      const block = await parseBlockAndFind(151);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 11);

      assert.strictEqual(tx.blockNumber, 151);
      assert.strictEqual(tx.transactionId, '0caae5e807b2a3281ea57f0041bdbed48838d09e');
      assert.strictEqual(tx.timestamp, 1585583034,);
      assert.strictEqual(tx.operation, 'tokens_transfer');
      assert.strictEqual(tx.from, 'hive-engine');
      assert.strictEqual(tx.to, 'hive-tokens');
      assert.strictEqual(tx.symbol, 'BEE');
      assert.strictEqual(tx.quantity, '1000');
      assert.strictEqual(tx.memo, null);
      assert.strictEqual(tx.account, 'hive-engine');

      resolve();
    })
      .then(() => {
        done();
      });
  });
});
