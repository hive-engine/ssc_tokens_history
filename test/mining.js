/* eslint-disable */
const assert = require('assert');
const { findTransaction } = require('./common');


describe('mining', function () {

  it('parse mining_lottery', (done) => {
    new Promise(async (resolve) => {
      const txId = '47888813-4';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 9);

      assert.strictEqual(tx.blockNumber, 2500628);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1602978684);
      assert.strictEqual(tx.operation, 'mining_lottery');
      assert.strictEqual(tx.poolId, 'TEST-EON:TEST-EON,TEST-EONM');
      assert.strictEqual(tx.symbol, 'TEST.EON');
      assert.strictEqual(tx.quantity, '1.500');
      assert.strictEqual(tx.account, 'badpupper');

      resolve();
    })
      .then(() => {
        done();
      });
  });

});
