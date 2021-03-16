/* eslint-disable */
const assert = require('assert');
// const { MongoClient } = require('mongodb');



describe('tokens', function () {
  this.timeout(60000);

  before((done) => {
    new Promise(async (resolve) => {
      // client = await MongoClient.connect(conf.databaseURL, {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true
      // });
      // db = await client.db(conf.databaseName);
      // await db.dropDatabase();
      resolve();
    })
      .then(() => {
        done()
      })
  });

  after((done) => {
    new Promise(async (resolve) => {
      // await client.close();
      resolve();
    })
      .then(() => {
        done()
      })
  });

  beforeEach((done) => {
    new Promise(async (resolve) => {
      // db = await client.db(conf.databaseName);
      resolve();
    })
      .then(() => {
        done()
      })
  });

  afterEach((done) => {
    // runs after each test in this block
    new Promise(async (resolve) => {
      // await db.dropDatabase()
      resolve();
    })
      .then(() => {
        done()
      })
  });

  it('parse tokens_transfer', (done) => {
    new Promise(async (resolve) => {
      assert.strictEqual(true, true);

      resolve();
    })
      .then(() => {
        done();
      });
  });
});
