const config = require('./config.json');

let activeNode = config.nodes[0];
let errorCount = 0;
let id = 0;

const nodeError = () => {
  errorCount += 1;
  if (errorCount === 3) {
    activeNode = config.nodes.shift();
    config.nodes.push(activeNode);
  }
};

const getBlockInfo = async (blockNumber) => {
  id += 1;
  const request = {
    id,
    jsonrpc: '2.0',
    method: 'blockchain.getBlockInfo',
    params: { blockNumber },
  };
  const response = await fetch(activeNode, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  if (response.ok) {
    const responseJSON = await response.json();
    if (responseJSON.error) {
      throw Error(responseJSON.error.message);
    }
    return responseJSON.result;
  }
  nodeError();
  throw Error('Could Not Get Block');
};

module.exports = {
  getBlockInfo,
};
