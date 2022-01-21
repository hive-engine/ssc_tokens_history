/* eslint-disable */
const assert = require('assert');
const { findTransaction, runParseBlock } = require('./common');


describe('mining', function () {

  it('parse mining_lottery', async () => {
      await runParseBlock({"_id":2500628,"blockNumber":2500628,"refHiveBlockNumber":47888813,"refHiveBlockId":"02dab9adbf2301dfa02aaf30484af172a898fb92","prevRefHiveBlockId":"02dab9acad8a21d6081fd85dcaec5039d241bddc","previousHash":"712eb478a4b37266fee4b8ca71f389a9f3c8c172b2a1e72f4bd11a8a44e75938","previousDatabaseHash":"b6c258c865053d03470470c358cedcc1454cd53e545586e9c717179272d52090","timestamp":"2020-10-17T23:51:24","transactions":[],"virtualTransactions":[{"refHiveBlockNumber":47888813,"transactionId":"47888813-4","sender":"null","contract":"mining","action":"checkPendingLotteries","payload":"","executedCodeHash":"09edd29b8301cae38e311f26bdbdd6ebf6979483d96bd7bdea5f4a14e6c0f1fb5b23db5ecbadb3bdb4b8e98116d1fa68a40b98bf84a3e2b9907ffa2d85c80a7d5b23db5ecbadb3bdb4b8e98116d1fa68a40b98bf84a3e2b9907ffa2d85c80a7d","hash":"b9ea9dccd6f63c276e8bd4d3833021e2fd864fe3ff89766730b33038ee978b6f","databaseHash":"dffbfcbc0918484063265938860c96b52dbbfeeb12ce47eef0f98a8b6bf0624f","logs":"{\"events\":[{\"contract\":\"mining\",\"event\":\"miningLottery\",\"data\":{\"poolId\":\"TEST-EON:TEST-EON,TEST-EONM\",\"winners\":[{\"winner\":\"badpupper\",\"winningNumber\":\"35119.29739538046649481268\",\"winningAmount\":\"1.500\"},{\"winner\":\"prettynicevideo\",\"winningNumber\":\"98881.5022644060122130456\",\"winningAmount\":\"1.500\"}]}},{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"tokens\",\"to\":\"badpupper\",\"symbol\":\"TEST.EON\",\"quantity\":\"1.500\"}},{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"tokens\",\"to\":\"prettynicevideo\",\"symbol\":\"TEST.EON\",\"quantity\":\"1.500\"}}]}"}],"hash":"fabaf81b2f6a716cc6e126271d98a07964e75e63d09b3b68d51ebfe567626752","databaseHash":"a8cb3bea9a186b2ccf3772a40b192d9d12ccc870132c05cbd2ba71eddc1025e0","merkleRoot":"8fd891fe39cbd16968ab0c3367011ea0149bc49de74ee3f2366b47736087c132","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
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

  });

});
