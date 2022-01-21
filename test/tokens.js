/* eslint-disable */
const assert = require('assert');
const { findTransaction, runParseBlock } = require('./common');


describe('tokens', function () {

  it('parse tokens_transfer', async () => {
      await runParseBlock({"_id":151,"blockNumber":151,"refHiveBlockNumber":42106781,"refHiveBlockId":"02827f9de39cca41162da2512e4b75fdfb2e4cc6","prevRefHiveBlockId":"02827f9ce5e1b6de959cba5a50c08fad80401184","previousHash":"e8ac67f355e3fd637c242a58a2fa9b97db841d7b2cdd400f1dc77c3a31a53bd9","previousDatabaseHash":"3e70fbcbd43eeeadc9f15b6eeb85218fdea65300410e95f2cf82bc7aac6b1372","timestamp":"2020-03-30T15:43:54","transactions":[{"refHiveBlockNumber":42106781,"transactionId":"0caae5e807b2a3281ea57f0041bdbed48838d09e","sender":"hive-engine","contract":"tokens","action":"transfer","payload":"{\"symbol\":\"BEE\",\"to\":\"hive-tokens\",\"quantity\":\"1000\",\"memo\":\"\",\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"cac542dbbb473f9ec35df853f77a873c49d59d631fcc18c7c41407528b9f0ba6","databaseHash":"ce8fe98307148a7b0748e85585e84d7654b847e92aafa10f9c4814ca1c9a83ba","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transfer\",\"data\":{\"from\":\"hive-engine\",\"to\":\"hive-tokens\",\"symbol\":\"BEE\",\"quantity\":\"1000\"}}]}"}],"virtualTransactions":[],"hash":"5c41d65ebe164434bfd165fc4b794e8b4694ea826a8f7eddbb6f13bfc8f1efd6","databaseHash":"d86cf9a107e7af0d67f15c24a0442cf251a3d36dc969b8064030e6fc1671610f","merkleRoot":"33b535a674b2996364fd32de73ac5d638a51709e77f9ccbf7e08f270c5c0b946","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""})
      const txId = '0caae5e807b2a3281ea57f0041bdbed48838d09e';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 11);

      assert.strictEqual(tx.blockNumber, 151);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585583034);
      assert.strictEqual(tx.operation, 'tokens_transfer');
      assert.strictEqual(tx.from, 'hive-engine');
      assert.strictEqual(tx.to, 'hive-tokens');
      assert.strictEqual(tx.symbol, 'BEE');
      assert.strictEqual(tx.quantity, '1000');
      assert.strictEqual(tx.memo, null);
      assert.strictEqual(tx.account, 'hive-engine');

  });

  it('parse tokens_issue', async () => {
      await runParseBlock({"_id":175,"blockNumber":175,"refHiveBlockNumber":42112438,"refHiveBlockId":"028295b670aaf8ce77ad5bdfdfb6ad919ae71041","prevRefHiveBlockId":"028295b5aaa7cd706e05efc96276e87b15b28a4f","previousHash":"5ceb95f1229e8ea189806e9b1022317fd2bc4e6713fa8f6ea0851bb4d7cdc392","previousDatabaseHash":"83447f28f3ca1e2598ef7d3c50ab042b64fdd74594b54fd45e2040c706dcb6bf","timestamp":"2020-03-30T20:27:42","transactions":[{"refHiveBlockNumber":42112438,"transactionId":"66e78b76da1adcb2afc8a289a8fa9a1107d0d8a2","sender":"someguy123","contract":"tokens","action":"issue","payload":"{\"symbol\":\"SGTK\",\"to\":\"someguy123\",\"quantity\":\"10000\",\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"85797248b355e97e232aba52cce6e870e6ef353c7c2f6c93759487ca9d3530f5","databaseHash":"0668f53c75c410c019d6c2f8bc74d06d0305b180ef2c4867693761bd8f650f4c","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transferFromContract\",\"data\":{\"from\":\"tokens\",\"to\":\"someguy123\",\"symbol\":\"SGTK\",\"quantity\":\"10000\"}}]}"}],"virtualTransactions":[],"hash":"ceb3f8d7e04e19f47f76cd57f581bc6fffed4245f1dc090a24a33a947780bc8c","databaseHash":"6c0cad5745fd43b36325fe4376716d7cfc01378b196a263a258a2a9235e7073d","merkleRoot":"3b6c299f6078ac656142fd511fc54f0f6258ca479994222ad67414e4578a3f82","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = '66e78b76da1adcb2afc8a289a8fa9a1107d0d8a2';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 11);

      assert.strictEqual(tx.blockNumber, 175);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585600062);
      assert.strictEqual(tx.operation, 'tokens_issue');
      assert.strictEqual(tx.from, 'contract_tokens');
      assert.strictEqual(tx.to, 'someguy123');
      assert.strictEqual(tx.symbol, 'SGTK');
      assert.strictEqual(tx.quantity, '10000');
      assert.strictEqual(tx.memo, null);
      assert.strictEqual(tx.account, 'someguy123');

  });

  it('parse tokens_transferToContract', async () => {
      await runParseBlock({"_id":17588,"blockNumber":17588,"refHiveBlockNumber":42642566,"refHiveBlockId":"028aac863803be9ea43901120f3b440efa0d1122","prevRefHiveBlockId":"028aac85b9a197432704eba63c3f1c101f2003d7","previousHash":"7db1dbe1414ae01c4d3fb07c4d34e01ccb1d6b4375b99a5b5faabd5852154e3b","previousDatabaseHash":"0cc67c92f70ec002ffefa6cab6edfbb83d3f2bd85260aa3713da3d3de7ac0842","timestamp":"2020-04-18T07:51:15","transactions":[{"refHiveBlockNumber":42642566,"transactionId":"5f0843e672868f3eb31b7c93fff0e8ea394f3267","sender":"cryptomancer","contract":"tokens","action":"transferToContract","payload":"{\"symbol\":\"BEE\",\"quantity\":\"300\",\"to\":\"crittermanager\",\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"19f4489fe8500162d67040e406227a28185839316ca353105926cd1bb11aa8ee","databaseHash":"3c5aa3429952371281873b3f5a602f0556b23c3dac26d78edd2f1a7be0fe7b6e","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transferToContract\",\"data\":{\"from\":\"cryptomancer\",\"to\":\"crittermanager\",\"symbol\":\"BEE\",\"quantity\":\"300\"}}]}"}],"virtualTransactions":[],"hash":"116d2b75d34b7578fc4d2f53c12959aed4f52e641156fda9375c25b496ee8425","databaseHash":"7cfac79e3fcf5f9024f799563fc569f4368495c100f2f87335283d32f89b6f86","merkleRoot":"8b94ee602ceef92bbc0ead81c48e9c71f853b9cf45b1c01742dbb8aa8163a368","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = '5f0843e672868f3eb31b7c93fff0e8ea394f3267';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 11);

      assert.strictEqual(tx.blockNumber, 17588);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1587196275);
      assert.strictEqual(tx.operation, 'tokens_transferToContract');
      assert.strictEqual(tx.from, 'cryptomancer');
      assert.strictEqual(tx.to, 'contract_crittermanager');
      assert.strictEqual(tx.symbol, 'BEE');
      assert.strictEqual(tx.quantity, '300');
      assert.strictEqual(tx.memo, null);
      assert.strictEqual(tx.account, 'cryptomancer');

  });

  it('parse tokens_updatePrecision', async () => {
      await runParseBlock({"_id":168835,"blockNumber":168835,"refHiveBlockNumber":43249929,"refHiveBlockId":"0293f1095a387351a60d52cffd618d0fd0371379","prevRefHiveBlockId":"0293f108c7aee63e691f66625db7bd8f83fe42c1","previousHash":"8af7fd98637f93cd0637f42d34dbd74cc1eb28689409ab5a2f881e5423802b21","previousDatabaseHash":"f3e71de0fc0f472e4d87f061b3a21b9bdfbc52cd9bf1cb9458e6a7a0eb820f07","timestamp":"2020-05-09T11:51:15","transactions":[{"refHiveBlockNumber":43249929,"transactionId":"3ef83bc32443428d16a3712641693fd49a86c1fd","sender":"tsnaks","contract":"tokens","action":"updatePrecision","payload":"{\"symbol\":\"EEK\",\"precision\":8,\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"79878df28b8bf92b8f6e21177dc9ba3b67e58d86bb094d9400bad685f2abd3e9","databaseHash":"e38c8d467a8085c8fff2bff426eb87797a3f8fa58a59f012ded1485f19c6d315","logs":"{}"}],"virtualTransactions":[],"hash":"5c06ac4daafc7e7c4b02480ecf3f8bb991a0afb78ffb5e23461d4aa8f49e6649","databaseHash":"109d78b870ba6c45c93f21970fbcdf69bd6e27a605eeb60cc512d0452980fa3e","merkleRoot":"7834db8ed2c3a20895080e4e42ca790513680ab93eae4d9cad5a804d1382f6c8","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = '3ef83bc32443428d16a3712641693fd49a86c1fd';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 8);

      assert.strictEqual(tx.blockNumber, 168835);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1589025075);
      assert.strictEqual(tx.operation, 'tokens_updatePrecision');
      assert.strictEqual(tx.symbol, 'EEK');
      assert.strictEqual(tx.newPrecision, 8);
      assert.strictEqual(tx.account, 'tsnaks');

  });

  // it('parse tokens_updateUrl', (done) => {
  //   new Promise(async (resolve) => {
  //     // TODO
  //     const txId = '5f0843e672868f3eb31b7c93fff0e8ea394f3267';
  //     const block = await findTransaction(txId);
  //     const tx = block[0];
  //
  //     // attributes tested below + 1 for object id
  //     assert.strictEqual(Object.keys(tx).length, 8);
  //
  //     assert.strictEqual(tx.blockNumber, 17588);
  //     assert.strictEqual(tx.transactionId, txId);
  //     assert.strictEqual(tx.timestamp, 1587196275);
  //     assert.strictEqual(tx.operation, 'tokens_transferToContract');
  //     assert.strictEqual(tx.symbol, 'BEE');
  //     assert.strictEqual(tx.newUrl, "");
  //     assert.strictEqual(tx.account, 'cryptomancer');
  //
  //     resolve();
  //   })
  //     .then(() => {
  //       done();
  //     });
  // });

  it('parse tokens_updateMetadata', async () => {
      await runParseBlock({"_id":32,"blockNumber":32,"refHiveBlockNumber":41971378,"refHiveBlockId":"02806eb22633aeba9acefcb3a43c3a2bcfdcdc32","prevRefHiveBlockId":"02806eb1a3163c3ee29e81e725eb58a868632de6","previousHash":"0e0b418cd7bae6960161cd005ccaf035c9129de78356455f2ce1f46d42c2047d","previousDatabaseHash":"69c56e396ab89e51119f3a72140d37e9e87ca4d4fe171ba7095ff92c948f9f11","timestamp":"2020-03-25T22:18:57","transactions":[{"refHiveBlockNumber":41971378,"transactionId":"e4d8cd0b88087de3dd30d1238fce7a64f77743f3","sender":"steemmonsters","contract":"tokens","action":"updateMetadata","payload":"{\"symbol\":\"ORB\",\"metadata\":{\"url\":\"https://splinterlands.com\",\"icon\":\"https://s3.amazonaws.com/steemmonsters/website/ui_elements/open_packs/img_essence-orb.png\",\"desc\":\"A limited edition Splinterlands card pack containing 5 cards exclusive to Essence Orbs.\"},\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"cfb6c6cd532a5f50d7a7417858c95bf98953e3ad372dff0e4e40382cf4854932","databaseHash":"652ed1a6bc7776afec30a07cc9d65a98eee2135c77cfea0c5623b8456dcf2778","logs":"{}"}],"virtualTransactions":[],"hash":"0239fe3cefbadf21c66fa8b0b41a690217596387304949103b96dfca5fa0376c","databaseHash":"f754fee006a366af4cf20fb8b0eba80183c7b60182516d7077c84504a32d1ff9","merkleRoot":"08324eb6fbf20be131ff5f75839bddc922a126ea59afee3b413fc1c48a4a7d3b","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = 'e4d8cd0b88087de3dd30d1238fce7a64f77743f3';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 8);

      assert.strictEqual(tx.blockNumber, 32);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585174737);
      assert.strictEqual(tx.operation, 'tokens_updateMetadata');
      assert.strictEqual(tx.symbol, 'ORB');
      assert.strictEqual(tx.newMetadata, "{\"url\":\"https://splinterlands.com\",\"icon\":\"https://s3.amazonaws.com/steemmonsters/website/ui_elements/open_packs/img_essence-orb.png\",\"desc\":\"A limited edition Splinterlands card pack containing 5 cards exclusive to Essence Orbs.\"}");
      assert.strictEqual(tx.account, 'steemmonsters');

  });

  it('parse tokens_transferOwnership', async () => {
      await runParseBlock({"_id":207,"blockNumber":207,"refHiveBlockNumber":42116425,"refHiveBlockId":"0282a549e70e40d25703d5f21a4d59779e9d1d7b","prevRefHiveBlockId":"0282a5488059664d5444083e610dc9e03bc381e9","previousHash":"aa7a93cbdfa79bbe57d9bc8686462cb706876a80a1e30f933e0bdd02502b8ce1","previousDatabaseHash":"0049fb1ade065f1ab2b152d3fb66674018206724c068771ddb84ec8611950209","timestamp":"2020-03-30T23:47:36","transactions":[{"refHiveBlockNumber":42116425,"transactionId":"2220e82801be437811290408dc2a0d7bad44f11b","sender":"steem-tokens","contract":"tokens","action":"transferOwnership","payload":"{\"symbol\":\"SWAP.GOLOS\",\"to\":\"graphene-swap\",\"recipient\":\"steem-tokens\",\"amountHIVEHBD\":\"0.001 HBD\",\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"ad8b3513a26aa3359c739a53d01e7bfe7c1ae50b9f2e126764817e077a92c7cf","databaseHash":"32fec4f8a8bfb57274363830289fad8462ff2bb89613a4b76d46d6df8d7cf0d9","logs":"{}"}],"virtualTransactions":[],"hash":"799c0f72d649772a70e4104793b5c4472079c5d9a04ecdc8b0b098ab0c77c431","databaseHash":"0983ea9d74f7c1c643427a19dc61973145284643a1530fa506931ec3fd381af9","merkleRoot":"84bdba641c11a1372bcead9d09737f7ec333fe2184723f4392d483af7c166529","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = '2220e82801be437811290408dc2a0d7bad44f11b';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 8);

      assert.strictEqual(tx.blockNumber, 207);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585612056);
      assert.strictEqual(tx.operation, 'tokens_transferOwnership');
      assert.strictEqual(tx.symbol, 'SWAP.GOLOS');
      assert.strictEqual(tx.newOwner, "graphene-swap");
      assert.strictEqual(tx.account, 'steem-tokens');

  });

  it('parse tokens_create', async () => {
      await runParseBlock({"_id":31,"blockNumber":31,"refHiveBlockNumber":41971340,"refHiveBlockId":"02806e8cd5b91ebef8dad9b8faa4a843fa6dd3f5","prevRefHiveBlockId":"02806e8b9eeda8eae6f160ddf1043bc8aabe6164","previousHash":"08e9f97302d157c99de176a0fb19b9d80a0d77bdfdf80957ca89023c8fcacc6d","previousDatabaseHash":"1233e5d952512c42614da5d936de806cc9312d6baac2bdb947f9dd8a6bd4f974","timestamp":"2020-03-25T22:17:03","transactions":[{"refHiveBlockNumber":41971340,"transactionId":"3f4b1da39a89dd42d8bb9a82b09738c196fafdbf","sender":"steemmonsters","contract":"tokens","action":"create","payload":"{\"symbol\":\"ORB\",\"name\":\"Essence Orbs\",\"precision\":0,\"maxSupply\":\"200000\",\"url\":\"https://splinterlands.com\",\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"559ed1cb74187491a129110abe27a45b21ce319628b0a96e6953d0383d690caf","databaseHash":"a9c7af76800a5a20763bf0c3ca88e25abf954b9a4c43a27a869d81dd4fe3bb11","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transfer\",\"data\":{\"from\":\"steemmonsters\",\"to\":\"null\",\"symbol\":\"BEE\",\"quantity\":\"100\"}}]}"}],"virtualTransactions":[],"hash":"0e0b418cd7bae6960161cd005ccaf035c9129de78356455f2ce1f46d42c2047d","databaseHash":"69c56e396ab89e51119f3a72140d37e9e87ca4d4fe171ba7095ff92c948f9f11","merkleRoot":"eb1d32a2b004003f086a2771d3647bc85e7f683f9f011ea304b81fccdf762e3c","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = '3f4b1da39a89dd42d8bb9a82b09738c196fafdbf';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 11);

      assert.strictEqual(tx.blockNumber, 31);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585174623);
      assert.strictEqual(tx.operation, 'tokens_create');
      assert.strictEqual(tx.symbol, 'ORB');
      assert.strictEqual(tx.name, 'Essence Orbs');
      assert.strictEqual(tx.url, 'https://splinterlands.com');
      assert.strictEqual(tx.precision, 0);
      assert.strictEqual(tx.maxSupply, '200000');
      assert.strictEqual(tx.account, 'steemmonsters');

  });

  it('parse tokens_enableStaking', async () => {
      await runParseBlock({"_id":363,"blockNumber":363,"refHiveBlockNumber":42198654,"refHiveBlockId":"0283e67e360dbad49eeafabe16ad19ed45112687","prevRefHiveBlockId":"0283e67d09b61b3ca2b853cf7119024d8c658f83","previousHash":"c7cbc7d8a352973688198f935bb1045469bd8e1ba97e469aeef8bbbd508b71d4","previousDatabaseHash":"263ddb5b241e043fdb26e06e21cbe1239313ea8abc05286d453d71c813a187f8","timestamp":"2020-04-02T20:36:51","transactions":[{"refHiveBlockNumber":42198654,"transactionId":"2355a0f6e3ea6246e79fbd3a4c843bd87327c8bf","sender":"eonwarped","contract":"tokens","action":"enableStaking","payload":"{\"symbol\":\"TEST.EON\",\"unstakingCooldown\":14,\"numberTransactions\":2,\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"3dfa781f2dd8b2539b28517a50845c6f75aeac084190d252916ce4b55997aca7","databaseHash":"4cea33e23c315d5c04d88a3b1cb6c519442c7d430266fb471941166508384ae5","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transfer\",\"data\":{\"from\":\"eonwarped\",\"to\":\"null\",\"symbol\":\"BEE\",\"quantity\":\"1000\"}}]}"}],"virtualTransactions":[],"hash":"cae73a80baa2a3617e7d9562056f85a5fa234561c76f0fd93c16ab3e7b1ca5cf","databaseHash":"85670935f858c483cda948f8958d39bfdf4a31f0e1f051af473c39afe0c06350","merkleRoot":"548fd5717caed1ebdc101d2a06f9aa475ac0f4ab30406738a07174788debe03d","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = '2355a0f6e3ea6246e79fbd3a4c843bd87327c8bf';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 9);

      assert.strictEqual(tx.blockNumber, 363);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585859811);
      assert.strictEqual(tx.operation, 'tokens_enableStaking');
      assert.strictEqual(tx.symbol, 'TEST.EON');
      assert.strictEqual(tx.unstakingCooldown, 14);
      assert.strictEqual(tx.numberTransactions, 2);
      assert.strictEqual(tx.account, 'eonwarped');

      // TODO add check for transferFee operation

  });

  it('parse tokens_stake', async () => {
      await runParseBlock({"_id":251,"blockNumber":251,"refHiveBlockNumber":42137793,"refHiveBlockId":"0282f8c12a64c44930ca7b14236126cc1cbb12e1","prevRefHiveBlockId":"0282f8c0b96738bbb3b0b895a3217893b9230eaa","previousHash":"837d471597d9db7ea45896996f63e579257ee1b916abe0b3a9699d0073b2f7f3","previousDatabaseHash":"96250354800c49ddcf46a494d798c36c84b3ad336589377dbe8d82b8f4397f5b","timestamp":"2020-03-31T17:41:30","transactions":[{"refHiveBlockNumber":42137793,"transactionId":"d125c326c620424fc3389852fd94e5ad8f3ad4f6","sender":"jjprac","contract":"tokens","action":"stake","payload":"{\"to\":\"jjprac\",\"symbol\":\"BEE\",\"quantity\":\"0.125\",\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"accce317c0635235e9e6958282f1d16ee769ef21ab00e3817da37c8a59052686","databaseHash":"2b8060812c2dc793a8afcf31bc46be6d02def88c434a36e9a4068257371aaef4","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"stake\",\"data\":{\"account\":\"jjprac\",\"symbol\":\"BEE\",\"quantity\":\"0.125\"}}]}"}],"virtualTransactions":[],"hash":"215b19a6157ae7150a36e7cfaec55566c132a1d0c58ccf756cb8672fc1bcc135","databaseHash":"bcdfa41830a9068818739c91c779552165259b2510d21acbbb60d80f00d0c47d","merkleRoot":"db1807135815a35d5f05005210c74ed6de137de19e00b8154ac3cc11f4d96c2f","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = 'd125c326c620424fc3389852fd94e5ad8f3ad4f6';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 10);

      assert.strictEqual(tx.blockNumber, 251);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585676490);
      assert.strictEqual(tx.operation, 'tokens_stake');
      assert.strictEqual(tx.symbol, 'BEE');
      assert.strictEqual(tx.from, 'jjprac');
      assert.strictEqual(tx.to, 'jjprac');
      assert.strictEqual(tx.quantity, '0.125');
      assert.strictEqual(tx.account, 'jjprac');

  });

  it('parse tokens_unstakeStart', async () => {
      await runParseBlock({"_id":456,"blockNumber":456,"refHiveBlockNumber":42227996,"refHiveBlockId":"0284591ceb3ca21c302ea752dc177c6a61bbf149","prevRefHiveBlockId":"0284591b319778639735ab8944c9d8ad1ef57220","previousHash":"12c79eb37504baf732b855462fa87688c6e6158af2d3f5909a0e13fe18508181","previousDatabaseHash":"30cbbb20cc0b9f991e6b4d5f6b5ff8043af73f9bc2394416132432da27fe9151","timestamp":"2020-04-03T21:09:48","transactions":[{"refHiveBlockNumber":42227996,"transactionId":"df21a5311af93b4440e7ecca6d59d2ac7c7845eb","sender":"eonwarped","contract":"tokens","action":"unstake","payload":"{\"symbol\":\"TEST.EON\",\"quantity\":\"10\",\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"20892fcbd19250a6ad9c3f09c21cf1aab1163d23c0a7ed888219e7df7f69cbda","databaseHash":"869adf9a5c31525f08f688cb641c00a47a19a3c658e43730a77838043a362597","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"unstakeStart\",\"data\":{\"account\":\"eonwarped\",\"symbol\":\"TEST.EON\",\"quantity\":\"10\"}}]}"}],"virtualTransactions":[],"hash":"0257203957abd2d8ede2f88fc5aa102284d3f183d64333c02bbb74755afeab0c","databaseHash":"f1c791a6a89459ceed0d133af4561dbdd69524c3aa8657fd1b940cf729dac97d","merkleRoot":"6ee8ed401171e60c8d93e18ec53b65735b147c1037997d1b2c17480d51949f65","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = 'df21a5311af93b4440e7ecca6d59d2ac7c7845eb';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 8);

      assert.strictEqual(tx.blockNumber, 456);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585948188);
      assert.strictEqual(tx.operation, 'tokens_unstakeStart');
      assert.strictEqual(tx.symbol, 'TEST.EON');
      assert.strictEqual(tx.quantity, '10');
      assert.strictEqual(tx.account, 'eonwarped');

  });

  it('parse tokens_unstakeDone', async () => {
      await runParseBlock({"_id":3766,"blockNumber":3766,"refHiveBlockNumber":42428887,"refHiveBlockId":"028769d7b095256de57f2db28f5bfb427d4dcf20","prevRefHiveBlockId":"028769d6a84fc409a9cdf3a0b322efde22f1e306","previousHash":"40def11e8c9125b4595eacc85c78bfde8546327f58a981ae2b110924f7121391","previousDatabaseHash":"466b82d417e8d94932e6736b2269c1d8622a313fc7906c1a08a3ed9e885d3689","timestamp":"2020-04-10T21:11:09","transactions":[],"virtualTransactions":[{"refHiveBlockNumber":42428887,"transactionId":"42428887-0","sender":"null","contract":"tokens","action":"checkPendingUnstakes","payload":"","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"2481624a5e2e8c937933406f885adcb926b86dea39da8463106e785299783ff4","databaseHash":"9f6940f96b1d0243934030de3ac1f28bafc530f5a909f5f485f767642dbeacbc","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"unstake\",\"data\":{\"account\":\"eonwarp\",\"symbol\":\"TEST.EON\",\"quantity\":\"2.500\"}}]}"}],"hash":"fb56e42c81d8b70e08a34ac2e875e337c2554d4bf541b16afd95651866000441","databaseHash":"592554eea33508c5e8cdb958743125481ef23f356e139608b61aa9967f22e6dd","merkleRoot":"82fc57a5dcf84053ef2ce5a77be7d32bdab0ec61a8ca1ec5ce9bbd20b8d44c40","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = '42428887-0';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 8);

      assert.strictEqual(tx.blockNumber, 3766);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1586553069);
      assert.strictEqual(tx.operation, 'tokens_unstakeDone');
      assert.strictEqual(tx.symbol, 'TEST.EON');
      assert.strictEqual(tx.quantity, '2.500');
      assert.strictEqual(tx.account, 'eonwarp');

  });

  it('parse tokens_cancelUnstake', async () => {
      await runParseBlock({"_id":500,"blockNumber":500,"refHiveBlockNumber":42247790,"refHiveBlockId":"0284a66e2ae939428770a79011287f1fa506d72a","prevRefHiveBlockId":"0284a66d5fac4951a0e23ab4c0770ffb2520e539","previousHash":"b3144ee8289e8c4daba49cd57b00a5b70db60358779c0ef7d1e8331d9b6aa095","previousDatabaseHash":"c437a5390ec0c11e4de1b5e4396267d7dde4864713c8090d70db9823efeb3ff1","timestamp":"2020-04-04T13:43:15","transactions":[{"refHiveBlockNumber":42247790,"transactionId":"6f4e72c680adf4ba3eb03f55823645201bf78e1e","sender":"eonwarped","contract":"tokens","action":"cancelUnstake","payload":"{\"txID\":\"df21a5311af93b4440e7ecca6d59d2ac7c7845eb\",\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"f41fe4e7e12b77d9721e16bcda2009a861441425d9c6e7f70e5bb5ad4072eef0","databaseHash":"68f03ce99e9daf885d5b54ad4f304ae47ccd884b312c0300017d69e620c62a15","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"unstake\",\"data\":{\"account\":\"eonwarped\",\"symbol\":\"TEST.EON\",\"quantity\":\"10\"}}]}"}],"virtualTransactions":[],"hash":"ba82fcc263237e7ee015c3f3e300b745c3a26116e340d38541eb7a0db090f98d","databaseHash":"f10ea372209ff54bd4dbbbdd823d9342c888628b4d2a67632ffa9b2a255629f9","merkleRoot":"fe3074d2e902ff4a6114fb8810d41d142e67bddc869667bc3c4f70837c6a2c2e","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = '6f4e72c680adf4ba3eb03f55823645201bf78e1e';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 9);

      assert.strictEqual(tx.blockNumber, 500);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1586007795);
      assert.strictEqual(tx.operation, 'tokens_cancelUnstake');
      assert.strictEqual(tx.symbol, 'TEST.EON');
      assert.strictEqual(tx.unstakeTxID, 'df21a5311af93b4440e7ecca6d59d2ac7c7845eb');
      assert.strictEqual(tx.quantityReturned, '10');
      assert.strictEqual(tx.account, 'eonwarped');

  });

  it('parse tokens_enableDelegation', async () => {
      await runParseBlock({"_id":461,"blockNumber":461,"refHiveBlockNumber":42228071,"refHiveBlockId":"02845967d6918e91be8d5975e439f7ee5a84add2","prevRefHiveBlockId":"02845966c0c223ca236255ea69927ad97bbe45b6","previousHash":"4a23b6ae0d186e309ca4c1a28404ef1b7a835db952fc7fbd0f2023b72a28a357","previousDatabaseHash":"02e779f5af1c70eb3e04060fe8c1f377a254912cb81a1e8f8c9c535daa6ce68e","timestamp":"2020-04-03T21:13:33","transactions":[{"refHiveBlockNumber":42228071,"transactionId":"9e974e0c6201b380b676d016f13aa048a971ee5d","sender":"eonwarped","contract":"tokens","action":"enableDelegation","payload":"{\"symbol\":\"TEST.EON\",\"undelegationCooldown\":10,\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"c9d039761cd650afa2ec31eca2f903fe0cb01cff60330cf93d1fd6a749df2a91","databaseHash":"22608d42fc8225f5e63c57c8df9814b75a236235af105355bdcfcc6edef2b0f2","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"transfer\",\"data\":{\"from\":\"eonwarped\",\"to\":\"null\",\"symbol\":\"BEE\",\"quantity\":\"1000\"}}]}"}],"virtualTransactions":[],"hash":"5c040808676229069ba227ce87e7be0a960bf54c5327cde0b7cf790173ff568d","databaseHash":"b7ea27505925255b3ca5c987e218ab2c919046e2cf796fe144acdb012b2b12f0","merkleRoot":"90389c1b9a373c8f255e972677d427393a3c2cf91f296ab11ef281b969169a93","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = '9e974e0c6201b380b676d016f13aa048a971ee5d';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 8);

      assert.strictEqual(tx.blockNumber, 461);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585948413);
      assert.strictEqual(tx.operation, 'tokens_enableDelegation');
      assert.strictEqual(tx.symbol, 'TEST.EON');
      assert.strictEqual(tx.undelegationCooldown, 10);
      assert.strictEqual(tx.account, 'eonwarped');

      // TODO add check for transferFee operation

  });

  it('parse tokens_delegate', async () => {
      await runParseBlock({"_id":464,"blockNumber":464,"refHiveBlockNumber":42228147,"refHiveBlockId":"028459b315beaff2f7c2cbd53be8789e0921c913","prevRefHiveBlockId":"028459b241801faef4d92522202795c546846454","previousHash":"a2771f1a52e460bfa998a59b33c838ed522f33a8348d50384e1f46a3959b9b70","previousDatabaseHash":"43b0963444eec2412f873093b3fce0ebae25fda01ad4c70fe994ded0d742f365","timestamp":"2020-04-03T21:17:21","transactions":[{"refHiveBlockNumber":42228147,"transactionId":"c5668ff522e51b01382de9653be1cad81aa32e21","sender":"eonwarped","contract":"tokens","action":"delegate","payload":"{\"to\":\"bluerobo\",\"symbol\":\"TEST.EON\",\"quantity\":\"25\",\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"2c3be998b44d059a25ac2ecc4fd648795788ec3ce3e16de309a197878c15f248","databaseHash":"8f3e88bece46eb3a3ef61d69a8c7e8d5497aae7eb3fa2d078d22c903835d633c","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"delegate\",\"data\":{\"to\":\"bluerobo\",\"symbol\":\"TEST.EON\",\"quantity\":\"25\"}}]}"}],"virtualTransactions":[],"hash":"7d7addfa09016b941cb233297f666d688a366fa3d0ffed7a645a2fd187b87470","databaseHash":"fd46a3f45325d1f3175b89973c92880582de3d0149571c2ab53d600612d79245","merkleRoot":"94ce0d4620364ef2f967b264b9e945e29b95a43a392ffd0161cf2d8d92f2c0fe","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = 'c5668ff522e51b01382de9653be1cad81aa32e21';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 10);

      assert.strictEqual(tx.blockNumber, 464);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1585948641);
      assert.strictEqual(tx.operation, 'tokens_delegate');
      assert.strictEqual(tx.symbol, 'TEST.EON');
      assert.strictEqual(tx.from, 'eonwarped');
      assert.strictEqual(tx.to, 'bluerobo');
      assert.strictEqual(tx.quantity, '25');
      assert.strictEqual(tx.account, 'eonwarped');

  });

  it('parse tokens_undelegateStart', async () => {
      await runParseBlock({"_id":505,"blockNumber":505,"refHiveBlockNumber":42248161,"refHiveBlockId":"0284a7e19c3294a34cf9be426258bcc24677f450","prevRefHiveBlockId":"0284a7e002330a00b700d02c69c407d62e2fed0f","previousHash":"c2774f9ee9f0ce3513b9957427ea95c6c1accf23717124f9bd7a2f6e661b2419","previousDatabaseHash":"369a1ab10d2256311844baafe26dcaa2678d2dffea115e89b6d1e775700275d0","timestamp":"2020-04-04T14:01:51","transactions":[{"refHiveBlockNumber":42248161,"transactionId":"691bfa8c333d3810945300fdcbd676cea54c68f9","sender":"eonwarped","contract":"tokens","action":"undelegate","payload":"{\"from\":\"eonwarp\",\"symbol\":\"TEST.EON\",\"quantity\":\"11\",\"isSignedWithActiveKey\":true}","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"2f783174323e9a570a2caf89eeccd128345b8a105834d8414e1234fc8d032af5","databaseHash":"624df668b91f6b89a0e596fe5318cc739be43201596472a479ec28e604443aaf","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"undelegateStart\",\"data\":{\"from\":\"eonwarp\",\"symbol\":\"TEST.EON\",\"quantity\":\"11\"}}]}"}],"virtualTransactions":[],"hash":"32e8f47d9bb062e6d0c39ef436d426395d97abab61a2813914145de3fa7e2fdb","databaseHash":"aa575db3ada912286a3d7990e5a6eb25622253a1a0645824094addd71c4ed54b","merkleRoot":"2669ce641700dc25cddf8efa1eab9d9ec28eb86efdb357382837a4ce270eef73","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = '691bfa8c333d3810945300fdcbd676cea54c68f9';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 10);

      assert.strictEqual(tx.blockNumber, 505);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1586008911);
      assert.strictEqual(tx.operation, 'tokens_undelegateStart');
      assert.strictEqual(tx.symbol, 'TEST.EON');
      assert.strictEqual(tx.from, 'eonwarp');
      assert.strictEqual(tx.to, 'eonwarped');
      assert.strictEqual(tx.quantity, '11');
      assert.strictEqual(tx.account, 'eonwarped');

  });

  it('parse tokens_undelegateDone', async () => {
      await runParseBlock({"_id":7460,"blockNumber":7460,"refHiveBlockNumber":42535136,"refHiveBlockId":"028908e0384851ec262e4e347a4ba1226cfd9c6c","prevRefHiveBlockId":"028908dfb8ea08ce613ba5242a9bd07bcd1f5b30","previousHash":"0b41254552489a199bc53b9c39718a37da47925b6fff401b8d77659da8cfdb77","previousDatabaseHash":"b6044a54d6d7cdfdce3844e65758c1fff9fb3d4fff76f11860cfaebd9f107fcb","timestamp":"2020-04-14T14:01:51","transactions":[],"virtualTransactions":[{"refHiveBlockNumber":42535136,"transactionId":"42535136-1","sender":"null","contract":"tokens","action":"checkPendingUndelegations","payload":"","executedCodeHash":"9f4e5ec54de1c9ca9365646184ee91d80260f795b6dada8a922ddca8ad4b3e10","hash":"ab436cef7d1f817997054b8873684c4d3ca966c8aad518824fcd2eddb683be12","databaseHash":"d911bf351ee3f8871f76cf639faa4a01af56cf1cee6e3a260336f0a78cc2a748","logs":"{\"events\":[{\"contract\":\"tokens\",\"event\":\"undelegateDone\",\"data\":{\"account\":\"eonwarped\",\"symbol\":\"TEST.EON\",\"quantity\":\"11\"}}]}"}],"hash":"8fc9f65c64580e60a1099e2724e80614d54024124ba7a7fc12fc36d2ebfbdb1f","databaseHash":"e9c9206c6fcdcae944c70124278d5cd2826c0ef262c0fffb6ab014217bc18ce5","merkleRoot":"b709bb03e015c894fd7dcf39f2abc793e21c8297d314ca3d53635f2a66cd897e","round":null,"roundHash":"","witness":"","signingKey":"","roundSignature":""});
      const txId = '42535136-1';
      const block = await findTransaction(txId);
      const tx = block[0];

      // attributes tested below + 1 for object id
      assert.strictEqual(Object.keys(tx).length, 8);

      assert.strictEqual(tx.blockNumber, 7460);
      assert.strictEqual(tx.transactionId, txId);
      assert.strictEqual(tx.timestamp, 1586872911);
      assert.strictEqual(tx.operation, 'tokens_undelegateDone');
      assert.strictEqual(tx.symbol, 'TEST.EON');
      assert.strictEqual(tx.quantity, '11');
      assert.strictEqual(tx.account, 'eonwarped');

  });


  // it('parse tokens_transferFromContract', (done) => {
  //   new Promise(async (resolve) => {
  //     // TODO
  //     resolve();
  //   })
  //     .then(() => {
  //       done();
  //     });
  // });

});
