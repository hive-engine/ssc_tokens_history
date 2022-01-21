/* eslint-disable */
const { setupDB, destroyDB } = require('./common');

describe('test all contracts', function () {

  before(async () => {
    await setupDB();
  });

  after(async () => {
    await destroyDB();
  });

  require('./tokens');
  require('./hivepegged');
  require('./mining');
  require('./market');
  require('./comments');
  require('./nftauction');

});
