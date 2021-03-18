/* eslint-disable */
const assert = require('assert');
const { findTransaction } = require('./common');


describe('tokens', function () {

  it('parse tokens_transfer', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_issue', (done) => {
    new Promise(async (resolve) => {
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
      assert.strictEqual(tx.account, 'contract_tokens');

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_transferToContract', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_updatePrecision', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
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

  it('parse tokens_updateMetadata', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_transferOwnership', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_create', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_enableStaking', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_stake', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_unstakeStart', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_unstakeDone', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_cancelUnstake', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_enableDelegation', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_delegate', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_undelegateStart', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
  });

  it('parse tokens_undelegateDone', (done) => {
    new Promise(async (resolve) => {
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

      resolve();
    })
      .then(() => {
        done();
      });
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
