/* eslint-disable */
const assert = require('assert');
const { findTransaction, runParseBlock } = require('./common');


describe('hivepegged', function () {

  it('parse hivepegged_buy', async () => {
      await runParseBlock(
{"_id":1,"blockNumber":1,"refHiveBlockNumber":41967403,"refHiveBlockId":"02805f2b0965133a9e47b8665eea47fff8186b2c","prevRefHiveBlockId":"02805f2a1a78cc9e4eed2ef5e23a0745d2310d98","previousHash":"66e2be521f83eb882b0736054f4e172769e6bcb68303f668799243b4beee8650","previousDatabaseHash":"9358cdfbc5d508a188506b51b6fbcb2a1a43322bf74179665520b7dc0510f0c7","timestamp":"2020-03-25T18:59:12","transactions":[{"refHiveBlockNumber":41967403,"transactionId":"3398782dae26b26a00c6a2784bbbce10d3112435","sender":"steemsc","contract":"hivepegged","action":"buy","payload":"{\"recipient\":\"honey-swap\",\"amountHIVEHBD\":\"1.000 HIVE\",\"isSignedWithActiveKey\":true}","executedCodeHash":"b220418036c5b78431ebd92327e1d14a5caa71039a357fe452c60a457e8e78259f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"517042930383bb1f578931351489bedcc2ec0bf8d86bae035c03eda117ef1158","databaseHash":"43a7de40d4d64766cf103347429f150e1b243463e7a050e36c2844c76ba115d8","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transfer\",\"data\":{\"from\":\"honey-swap\",\"to\":\"steemsc\",\"symbol\":\"SWAP.HIVE\",\"quantity\":\"0.990\"}}]}"}],"virtualTransactions":[],"hash":"d19a847de664bd268fd7d8cc6a99bb7110101fb3cb50bccea56657c1eb9f5ae1","databaseHash":"167c94db87d6366c5825bfcefa84094d692e042b4247c813b4a9d868083dd34e","merkleRoot":"fbdf7411e7970683a164a49ee50ca8aff185dad5b0f5e977c86a0264cf22a3c0","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
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
      await runParseBlock({"_id":3,"blockNumber":3,"refHiveBlockNumber":41968338,"refHiveBlockId":"028062d208b34f351f9533c8cc790b71c79f3adb","prevRefHiveBlockId":"028062d13d782c811336b4b360d1c4e93c697b8e","previousHash":"cfbb01a428ac74565d630d6de61dc3cea5ded5d5a97a94defaa36b91cf6fcdb2","previousDatabaseHash":"be8d6d486137a18027d5877800f41aacb52a2c6edf4fad32b0e7f9ab2284220d","timestamp":"2020-03-25T19:46:24","transactions":[{"refHiveBlockNumber":41968338,"transactionId":"506741cafd0d57f4907ca76ac3157f2449aa0f01","sender":"steemsc","contract":"hivepegged","action":"withdraw","payload":"{\"quantity\":\"0.990\",\"isSignedWithActiveKey\":true}","executedCodeHash":"b220418036c5b78431ebd92327e1d14a5caa71039a357fe452c60a457e8e78259f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"892fa49531725f35b79a8a3ff98074b06424eeec72db8e3eb0c7569885d50a5a","databaseHash":"6c83f81a887d1e83b21c4b924933e23b0e0f17e3841b57377c77e6ad9dd15815","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transfer\",\"data\":{\"from\":\"steemsc\",\"to\":\"honey-swap\",\"symbol\":\"SWAP.HIVE\",\"quantity\":\"0.990\"}}]}"}],"virtualTransactions":[],"hash":"51f800ccdc52746044e2937ed388dd9126535973d1791bedf3c002b3253a4964","databaseHash":"4adda64f63f196ba924c02030cc3d4daca6d6874c846ee1088b201b6133e9a8e","merkleRoot":"bdf0730a9a5f7df8430205e7983ce4f134b78690ce53ce150445ba8cce0dd74a","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
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
