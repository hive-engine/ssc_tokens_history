/* eslint-disable */
const assert = require('assert');
const { findTransaction } = require('./common');


describe('market', function () {

  it('parse market_cancel', (done) => {
    new Promise(async (resolve) => {
      const txId = '6aeb05dea1449479730a0983b4208542d4c34024';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 10);

      assert.strictEqual(tx.blockNumber, 22);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585171026);
      assert.strictEqual(tx.operation, 'market_cancel');
      assert.strictEqual(tx.symbol, 'SWAP.HIVE');
      assert.strictEqual(tx.orderType, 'buy');
      assert.strictEqual(tx.orderID, 'a47906faa9071cf524e0bc8909b0d6f81f4fd48f');
      assert.strictEqual(tx.quantityReturned, '0.00000001');
      assert.strictEqual(tx.account, 'steemsc');

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse market_buy', (done) => {
    new Promise(async (resolve) => {
      const txId = 'c4dbf635d0b322481e9ade3989413fe740f0fb65';
      const block = await findTransaction(txId);

      assert.strictEqual(block.length, 4);

      const placeOrder = block[0];
      const buyOrder = block[1];
      const sellOrder = block[2];
      const closeOrder = block[3];

      assert.strictEqual(placeOrder.blockNumber, 300);
      assert.strictEqual(placeOrder.transactionId, txId);
      assert.strictEqual(placeOrder.timestamp, 1585765644);

      assert.strictEqual(Object.keys(placeOrder).length, 10);
      assert.strictEqual(placeOrder.operation, 'market_placeOrder');
      assert.strictEqual(placeOrder.symbol, 'BEE');
      assert.strictEqual(placeOrder.orderType, 'buy');
      assert.strictEqual(placeOrder.price, '1');
      assert.strictEqual(placeOrder.quantityLocked, '1000.00000000');
      assert.strictEqual(placeOrder.account, 'neoxian');

      assert.strictEqual(Object.keys(buyOrder).length, 10);
      assert.strictEqual(buyOrder.operation, 'market_buy');
      assert.strictEqual(buyOrder.symbol, 'BEE');
      assert.strictEqual(buyOrder.from, 'hive-engine');
      assert.strictEqual(buyOrder.quantityTokens, '1000.00000000');
      assert.strictEqual(buyOrder.quantityHive, '1000.00000000');
      assert.strictEqual(buyOrder.account, 'neoxian');

      assert.strictEqual(Object.keys(sellOrder).length, 10);
      assert.strictEqual(sellOrder.operation, 'market_sell');
      assert.strictEqual(sellOrder.symbol, 'BEE');
      assert.strictEqual(sellOrder.to, 'neoxian');
      assert.strictEqual(sellOrder.quantityTokens, '1000.00000000');
      assert.strictEqual(sellOrder.quantityHive, '1000.00000000');
      assert.strictEqual(sellOrder.account, 'hive-engine');

      assert.strictEqual(Object.keys(closeOrder).length, 9);
      assert.strictEqual(closeOrder.operation, 'market_closeOrder');
      assert.strictEqual(closeOrder.symbol, 'BEE');
      assert.strictEqual(closeOrder.orderID, 'c4dbf635d0b322481e9ade3989413fe740f0fb65');
      assert.strictEqual(closeOrder.orderType, 'buy');
      assert.strictEqual(closeOrder.account, 'neoxian');

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse market_sell', (done) => {
    new Promise(async (resolve) => {
      // TODO expire, buyRemaining, sellRemaining
      const txId = 'be0a5d68ce3c944efba984e8e82aa600db70bf70';
      const block = await findTransaction(txId);

      assert.strictEqual(block.length, 4);

      const placeOrder = block[0];
      const buyOrder = block[1];
      const sellOrder = block[2];
      const closeOrder = block[3];

      assert.strictEqual(placeOrder.blockNumber, 988);
      assert.strictEqual(placeOrder.transactionId, txId);
      assert.strictEqual(placeOrder.timestamp, 1586339097);

      assert.strictEqual(Object.keys(placeOrder).length, 10);
      assert.strictEqual(placeOrder.operation, 'market_placeOrder');
      assert.strictEqual(placeOrder.symbol, 'RECOIN');
      assert.strictEqual(placeOrder.orderType, 'sell');
      assert.strictEqual(placeOrder.price, '0.00000001');
      assert.strictEqual(placeOrder.quantityLocked, '3');
      assert.strictEqual(placeOrder.account, 'kork75');

      assert.strictEqual(Object.keys(buyOrder).length, 10);
      assert.strictEqual(buyOrder.operation, 'market_buy');
      assert.strictEqual(buyOrder.symbol, 'RECOIN');
      assert.strictEqual(buyOrder.from, 'kork75');
      assert.strictEqual(buyOrder.quantityTokens, '3.00000000');
      assert.strictEqual(buyOrder.quantityHive, '0.00000003');
      assert.strictEqual(buyOrder.account, 'barski');

      assert.strictEqual(Object.keys(sellOrder).length, 10);
      assert.strictEqual(sellOrder.operation, 'market_sell');
      assert.strictEqual(sellOrder.symbol, 'RECOIN');
      assert.strictEqual(sellOrder.to, 'barski');
      assert.strictEqual(sellOrder.quantityTokens, '3.00000000');
      assert.strictEqual(sellOrder.quantityHive, '0.00000003');
      assert.strictEqual(sellOrder.account, 'kork75');

      assert.strictEqual(Object.keys(closeOrder).length, 9);
      assert.strictEqual(closeOrder.operation, 'market_closeOrder');
      assert.strictEqual(closeOrder.symbol, 'RECOIN');
      assert.strictEqual(closeOrder.orderID, 'be0a5d68ce3c944efba984e8e82aa600db70bf70');
      assert.strictEqual(closeOrder.orderType, 'sell');
      assert.strictEqual(closeOrder.account, 'kork75');

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse market_expire', (done) => {
    new Promise(async (resolve) => {
      const txId = '1284a72f1b4dddcf1ea45574851f430c98fbb32f';
      const block = await findTransaction(txId);

      assert.strictEqual(block.length, 2);

      const placeOrder = block[0];
      const expireOrder = block[1];

      assert.strictEqual(placeOrder.blockNumber, 127070);
      assert.strictEqual(placeOrder.transactionId, txId);
      assert.strictEqual(placeOrder.timestamp, 1588501155);

      assert.strictEqual(Object.keys(placeOrder).length, 10);
      assert.strictEqual(placeOrder.operation, 'market_placeOrder');
      assert.strictEqual(placeOrder.symbol, 'SWAP.BTC');
      assert.strictEqual(placeOrder.orderType, 'sell');
      assert.strictEqual(placeOrder.price, '30872.48321148');
      assert.strictEqual(placeOrder.quantityLocked, '0.02031246');
      assert.strictEqual(placeOrder.account, 'samotrader');

      assert.strictEqual(Object.keys(expireOrder).length, 10);
      assert.strictEqual(expireOrder.operation, 'market_expire');
      assert.strictEqual(expireOrder.symbol, 'SWAP.BTC');
      assert.strictEqual(expireOrder.orderID, 'f86ac045b371d1256b50bca7cc5761a6b4d70ede');
      assert.strictEqual(expireOrder.orderType, 'buy');
      assert.strictEqual(expireOrder.quantityUnlocked, '1.00000000');
      assert.strictEqual(expireOrder.account, 'eirik');

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse market_buyRemaining', (done) => {
    new Promise(async (resolve) => {
      // TODO sellRemaining
      const txId = '29da2c6b1bb616ed06bf4c0609fd2a31e74206d1';
      const block = await findTransaction(txId);

      assert.strictEqual(block.length, 6);

      const remainingTx = block[3];

      assert.strictEqual(Object.keys(remainingTx).length, 11);

      assert.strictEqual(remainingTx.blockNumber, 4051);
      assert.strictEqual(remainingTx.transactionId, txId);
      assert.strictEqual(remainingTx.timestamp, 1586683407);
      assert.strictEqual(remainingTx.operation, 'market_buyRemaining');
      assert.strictEqual(remainingTx.symbol, 'SWAP.HIVE');
      assert.strictEqual(remainingTx.from, 'contract_market');
      assert.strictEqual(remainingTx.to, 'balte');
      assert.strictEqual(remainingTx.quantity, '0.00000001');
      assert.strictEqual(remainingTx.memo, null);
      assert.strictEqual(remainingTx.account, 'contract_market');

      resolve();
    })
      .then(() => {
        done();
      });
  });

});
