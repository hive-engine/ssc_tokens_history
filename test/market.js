/* eslint-disable */
const assert = require('assert');
const { findTransaction, runParseBlock } = require('./common');


describe('market', function () {

  it('parse market_cancel', async () => {
      await runParseBlock({"_id":22,"blockNumber":22,"refHiveBlockNumber":41970145,"refHiveBlockId":"028069e18636cf247d2891d3b2e04de64eb53400","prevRefHiveBlockId":"028069e0fa34e3d2e1157a0c24b09baebe470100","previousHash":"0b5f3e571ed2bf9598a3e2cc07b0dd6cce954f9a63e38d42dd2040ddb243eb35","previousDatabaseHash":"c3ea2a983dae51602046a9fd5c9aa3978dce1a6526006317a60426dd81ee2eb0","timestamp":"2020-03-25T21:17:06","transactions":[{"refHiveBlockNumber":41970145,"transactionId":"6aeb05dea1449479730a0983b4208542d4c34024","sender":"steemsc","contract":"market","action":"cancel","payload":"{\"type\":\"buy\",\"id\":\"a47906faa9071cf524e0bc8909b0d6f81f4fd48f\",\"isSignedWithActiveKey\":true}","executedCodeHash":"daca9f4f772da3be08a257770395408eb188d319965a825026d12de52ab5b1949f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"f47accc9b1c3deeee786acbeded2f8dd034dc4759b4654f0516bebcfa1d7b34c","databaseHash":"f8642d7c01258168bbfaefba2b3e8aea0e9d9830004e3d6e90f531b95394d23b","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"market\",\"to\":\"steemsc\",\"symbol\":\"SWAP.HIVE\",\"quantity\":\"0.00000001\"}}]}"}],"virtualTransactions":[],"hash":"35176c03ba0ab0df37ae8b686e61f9a8147056b7702a16e0d4f9b11e80c73ca6","databaseHash":"4d6f212403f8efb655b7d5ccb8190b6cea047d6a48a7aaa8f7d190cfccb4b8b0","merkleRoot":"039f1b0ce78555d5813fd37d62a20ed99f4e50d27cce329bfdcf790578ea4b15","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
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

  });

  it('parse market_buy', async () => {
      await runParseBlock({"_id":300,"blockNumber":300,"refHiveBlockNumber":42167391,"refHiveBlockId":"02836c5f549ae8d92b071bfaffbeadb79013fa4d","prevRefHiveBlockId":"02836c5e2765ee7424417062cace35ee10a2c921","previousHash":"598bed1c9a97e06539d4c77c0515a440683d771b48d793ad4c8195e2e4e16b74","previousDatabaseHash":"85d16120cd3d560a228fb24c2f36416502c3858571780375873ac7504809d34c","timestamp":"2020-04-01T18:27:24","transactions":[{"refHiveBlockNumber":42167391,"transactionId":"c4dbf635d0b322481e9ade3989413fe740f0fb65","sender":"neoxian","contract":"market","action":"buy","payload":"{\"symbol\":\"BEE\",\"quantity\":\"1000\",\"price\":\"1\",\"isSignedWithActiveKey\":true}","executedCodeHash":"daca9f4f772da3be08a257770395408eb188d319965a825026d12de52ab5b1949f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e109f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e109f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"f7efd55d7d39903bfc1d4ab4558a9d96597701152dad4c4c34c7650c96758ab7","databaseHash":"eeb9a72129b984df5fcb42d93929a19ba0e32807ed9063eb436b21eddb72ff9b","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transferToContract\",\"data\":{\"from\":\"neoxian\",\"to\":\"market\",\"symbol\":\"SWAP.HIVE\",\"quantity\":\"1000.00000000\"}},{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"market\",\"to\":\"neoxian\",\"symbol\":\"BEE\",\"quantity\":\"1000.00000000\"}},{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"market\",\"to\":\"hive-engine\",\"symbol\":\"SWAP.HIVE\",\"quantity\":\"1000.00000000\"}},{\"contract\":\"market\",\"event\":\"orderClosed\",\"data\":{\"account\":\"neoxian\",\"type\":\"buy\",\"txId\":\"c4dbf635d0b322481e9ade3989413fe740f0fb65\"}}]}"}],"virtualTransactions":[],"hash":"5337f59cde6769c3661a0ecbba83f946c6b2dc294b331356f70fea54c79d579a","databaseHash":"884d76ab25b9a9ce84e9a9d0d75e3282e1e2bc95577690ac5bc1be6fd37fc913","merkleRoot":"2bcb2c61ec663f07fea5384a3ff3c2dc620cbec32b2e4d5dfdf5ed2a2f2f9423","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
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

  });

  it('parse market_sell', async () => {
      await runParseBlock({"_id":988,"blockNumber":988,"refHiveBlockNumber":42357819,"refHiveBlockId":"0286543b810cb75a3933d66cf7ec7f5793fdee0d","prevRefHiveBlockId":"0286543a98c412e0ecbb1a7de82f63c1f2427839","previousHash":"539daa3bf5785979c712f5185aeff4af77ef7d5b8f32079988f116faf8afb672","previousDatabaseHash":"88b9d4401b13a3d7dfa69196201ef4afd36f63c32dfb31ca3b8b8046dcd19f8e","timestamp":"2020-04-08T09:44:57","transactions":[{"refHiveBlockNumber":42357819,"transactionId":"be0a5d68ce3c944efba984e8e82aa600db70bf70","sender":"kork75","contract":"market","action":"sell","payload":"{\"symbol\":\"RECOIN\",\"quantity\":\"3\",\"price\":\"0.00000001\",\"isSignedWithActiveKey\":true}","executedCodeHash":"daca9f4f772da3be08a257770395408eb188d319965a825026d12de52ab5b1949f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e109f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e109f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"47d4773cb19f6df598d934057bee247e3f42620098e64bf15824296dc666b301","databaseHash":"e990af08f9d2ea081feaf94c1588e91d362c19fd030c7090c9b679ccd71776bd","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transferToContract\",\"data\":{\"from\":\"kork75\",\"to\":\"market\",\"symbol\":\"RECOIN\",\"quantity\":\"3\"}},{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"market\",\"to\":\"barski\",\"symbol\":\"RECOIN\",\"quantity\":\"3.00000000\"}},{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"market\",\"to\":\"kork75\",\"symbol\":\"SWAP.HIVE\",\"quantity\":\"0.00000003\"}},{\"contract\":\"market\",\"event\":\"orderClosed\",\"data\":{\"account\":\"kork75\",\"type\":\"sell\",\"txId\":\"be0a5d68ce3c944efba984e8e82aa600db70bf70\"}}]}"}],"virtualTransactions":[],"hash":"b6b2df9bd141d7fa9bc9fe8bb8c0463d0516b12ddcdaba6142b3404b0765527c","databaseHash":"8a7418ffd7bbec64c5a35556efc72711c06b4f05ea062f6920b8f7b23a1c6e3d","merkleRoot":"c3071d61f157e7e8a1a0aec953a85abcc8da5852c7732a7e4323e214f69c2e52","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
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

  });

  it('parse market_expire', async () => {
      await runParseBlock({"_id":127070,"blockNumber":127070,"refHiveBlockNumber":43076122,"refHiveBlockId":"02914a1aa1998fb3d09d82e1d1175219b84d1260","prevRefHiveBlockId":"02914a197cce1a302e19d65aec6c79a480b3225c","previousHash":"46017aa8d0d590df72f151edccb3f4b37c6f1667e890e5c2bbb9d2bd30a65464","previousDatabaseHash":"dc4a80a9e408d474145b84d2ac26984654626f528ae3bdd6ab0899ce5120e535","timestamp":"2020-05-03T10:19:15","transactions":[{"refHiveBlockNumber":43076122,"transactionId":"1284a72f1b4dddcf1ea45574851f430c98fbb32f","sender":"samotrader","contract":"market","action":"sell","payload":"{\"symbol\":\"SWAP.BTC\",\"quantity\":\"0.02031246\",\"price\":\"30872.48321148\",\"isSignedWithActiveKey\":true}","executedCodeHash":"daca9f4f772da3be08a257770395408eb188d319965a825026d12de52ab5b1949f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e109f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"1724057f321e4f41aa31be82d39770401fdb3a8b84be8f4b901e05535af5817c","databaseHash":"73bdd741fa390e0d65225708a6619336c77ae8a14d61f83361b4fea1f0a0c49d","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transferToContract\",\"data\":{\"from\":\"samotrader\",\"to\":\"market\",\"symbol\":\"SWAP.BTC\",\"quantity\":\"0.02031246\"}},{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"market\",\"to\":\"eirik\",\"symbol\":\"SWAP.HIVE\",\"quantity\":\"1.00000000\"}},{\"contract\":\"market\",\"event\":\"orderExpired\",\"data\":{\"type\":\"buy\",\"txId\":\"f86ac045b371d1256b50bca7cc5761a6b4d70ede\"}}]}"}],"virtualTransactions":[],"hash":"4a3814c73cb772476d01de703958f3b678bc478c6b64875e69fba000bb5153f9","databaseHash":"4fe6da55abf1cb625066ad19d3438785fdaf884845ce12a71264524c0ea1e8c4","merkleRoot":"1dca7cafa0e60fd7aef30fd078e3c5515f18fb72cd1a69d9e4083c5107419a50","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
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

  });

  it('parse market_buyRemaining', async () => {
      await runParseBlock({"_id":4051,"blockNumber":4051,"refHiveBlockNumber":42472177,"refHiveBlockId":"028812f1d7aa4dd9a57ebb306019727c48247b40","prevRefHiveBlockId":"028812f02c83bed66ac34b20d9c4b9ece1178edd","previousHash":"8e46174a10760630be99f704b6e93977258abfc3e103cface45e0a23708ee567","previousDatabaseHash":"3badaba4a7adda40f5858eecab4b9a951f928ec1bc968ee77d4d26c648f171a5","timestamp":"2020-04-12T09:23:27","transactions":[{"refHiveBlockNumber":42472177,"transactionId":"29da2c6b1bb616ed06bf4c0609fd2a31e74206d1","sender":"balte","contract":"market","action":"buy","payload":"{\"symbol\":\"FOODIE\",\"quantity\":\"1\",\"price\":\"0.5\",\"isSignedWithActiveKey\":true}","executedCodeHash":"daca9f4f772da3be08a257770395408eb188d319965a825026d12de52ab5b1949f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e109f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e109f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e109f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"785681b05d4f279d12bcc00993675488b714032f2531d32adf5a3dae9d53cb50","databaseHash":"abb35ff1d6301bbdafcff43f17085f41a2ca92ff32911f5cc85cb9dd9aa452ea","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transferToContract\",\"data\":{\"from\":\"balte\",\"to\":\"market\",\"symbol\":\"SWAP.HIVE\",\"quantity\":\"0.50000000\"}},{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"market\",\"to\":\"balte\",\"symbol\":\"FOODIE\",\"quantity\":\"1.00000\"}},{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"market\",\"to\":\"xyzashu\",\"symbol\":\"SWAP.HIVE\",\"quantity\":\"0.49999999\"}},{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"market\",\"to\":\"balte\",\"symbol\":\"SWAP.HIVE\",\"quantity\":\"0.00000001\"}},{\"contract\":\"market\",\"event\":\"orderClosed\",\"data\":{\"account\":\"balte\",\"type\":\"buy\",\"txId\":\"29da2c6b1bb616ed06bf4c0609fd2a31e74206d1\"}}]}"}],"virtualTransactions":[],"hash":"2429dcf39ebde22052e4e834ac95d7616a7c0358881a6192d77dc715cd55e567","databaseHash":"bf4f5741f97a54130f6a9bb015f7fb78689c8848b166f90792e78e4ca3496eb4","merkleRoot":"349d1bd6e92b3566da38262fd571ea255d5e855bfffd9824941a8fed473ec971","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      // TODO sellRemaining
      const txId = '29da2c6b1bb616ed06bf4c0609fd2a31e74206d1';
      const block = await findTransaction(txId);

      assert.strictEqual(block.length, 5);

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
      assert.strictEqual(remainingTx.account, 'balte');

  });

});
