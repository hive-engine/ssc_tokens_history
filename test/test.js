/* eslint-disable */
const { setupDB, destroyDB } = require('./common');

describe('test all contracts', function () {
  this.timeout(1000);

  before((done) => {
    new Promise(async (resolve) => {
      await setupDB();
      resolve();
    })
      .then(() => {
        done()
      })
  });

  after((done) => {
    new Promise(async (resolve) => {
      await destroyDB();
      resolve();
    })
      .then(() => {
        done()
      })
  });

  require('./tokens');
  require('./hivepegged');
  require('./mining');
  require('./market');

});
