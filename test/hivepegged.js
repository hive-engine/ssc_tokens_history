/* eslint-disable */
const assert = require('assert');
const { findTransaction } = require('./common');


describe('hivepegged', function () {

  it('parse hivepegged_buy', async () => {
      const txId = '3398782dae26b26a00c6a2784bbbce10d3112435';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 11);

      assert.strictEqual(tx.blockNumber, 1);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585162752);
      assert.strictEqual(tx.operation, 'hivepegged_buy');
      assert.strictEqual(tx.from, 'honey-swap');
      assert.strictEqual(tx.to, 'steemsc');
      assert.strictEqual(tx.symbol, 'SWAP.HIVE');
      assert.strictEqual(tx.quantity, '0.990');
      assert.strictEqual(tx.memo, null);
      assert.strictEqual(tx.account, 'honey-swap');

  });

  it('parse hivepegged_withdraw', async () => {
      const txId = '506741cafd0d57f4907ca76ac3157f2449aa0f01';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 11);

      assert.strictEqual(tx.blockNumber, 3);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585165584);
      assert.strictEqual(tx.operation, 'hivepegged_withdraw');
      assert.strictEqual(tx.from, 'steemsc');
      assert.strictEqual(tx.to, 'honey-swap');
      assert.strictEqual(tx.symbol, 'SWAP.HIVE');
      assert.strictEqual(tx.quantity, '0.990');
      assert.strictEqual(tx.memo, null);
      assert.strictEqual(tx.account, 'steemsc');

  });

});
