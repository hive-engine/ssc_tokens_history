


const Contracts = {
  AIRDROPS: 'airdrops',
  BOT_CONTROLLER: 'botcontroller',
  CLAIMDROPS: 'claimdrops',
  CONTRACT: 'contract',
  CRITTER_MANAGER: 'crittermanager',
  DICE: 'dice',
  DISTRIBUTION: 'distribution',
  HIVE_PEGGED: 'hivepegged',
  INFLATION: 'inflation',
  MARKET: 'market',
  MARKET_MAKER: 'marketmaker',
  MARKET_POOLS: 'marketpools',
  MINING: 'mining',
  NFT: 'nft',
  NFT_MARKET: 'nftmarket',
  PACK_MANAGER: 'packmanager',
  SSC_STORE: 'sscstore',
  TOKENS: 'tokens',
  WITNESSES: 'witnesses',
};

const MarketContract = {
  CANCEL: 'cancel',
  BUY: 'buy',
  MARKET_BUY: 'marketBuy',
  SELL: 'sell',
  MARKET_SELL: 'marketSell',
  ORDER_CLOSED: 'orderClosed',
  ORDER_EXPIRED: 'orderExpired',
};

const TokensContract = {
  TRANSFER: 'transfer',
  TRANSFER_FROM_CONTRACT: 'transferFromContract',
  TRANSFER_TO_CONTRACT: 'transferToContract',
  ISSUE: 'issue',
  UPDATE_PRECISION: 'updatePrecision',
  UPDATE_URL: 'updateUrl',
  UPDATE_METADATA: 'updateMetadata',
  TRANSFER_OWNERSHIP: 'transferOwnership',
  CREATE: 'create',
  ENABLE_STAKING: 'enableStaking',
  STAKE: 'stake',
  UNSTAKE: 'unstake',
  CANCEL_UNSTAKE: 'cancelUnstake',
  ENABLE_DELEGATION: 'enableDelegation',
  DELEGATE: 'delegate',
  UNDELEGATE: 'undelegate',
  CHECK_PENDING_UNSTAKES: 'checkPendingUnstakes',
  CHECK_PENDING_UNDELEGATIONS: 'checkPendingUndelegations',
  UPDATE_PARAMS: 'updateParams',
};

const WitnessesContract = {
  PROPOSE_ROUND: 'proposeRound',
  REGISTER: 'register',
  APPROVE: 'approve',
  DISAPPROVE: 'disapprove',
  SCHEDULE_WITNESSES: 'scheduleWitnesses',
};

const HivePeggedContract = {
  BUY: 'buy',
  WITHDRAW: 'withdraw',
  REMOVE_WITHDRAWAL: 'removeWithdrawal',
};

const MiningContract = {
  CHECK_PENDING_LOTTERIES: 'checkPendingLotteries',
  CREATE_POOL: 'createPool',
  UPDATE_POOL: 'updatePool',
  SET_ACTIVE: 'setActive',
  CHANGE_NFT_PROPERTY: 'changeNftProperty',
};

const NftContract = {
  ISSUE: 'issue',
  ISSUE_MULTIPLE: 'issueMultiple',
  DELEGATE: 'delegate',
  TRANSFER: 'transfer',
  BURN: 'burn',
  SET_PROPERTIES: 'setProperties',
  CREATE: 'create',
  ADD_PROPERTY: 'addProperty',
  UPDATE_URL: 'updateUrl',
  UPDATE_METADATA: 'updateMetadata',
  UPDATE_NAME: 'updateName',
  UPDATE_ORG_NAME: 'updateOrgName',
  UPDATE_PRODUCT_NAME: 'updateProductName',
  SET_GROUP_BY: 'setGroupBy',
  ADD_AUTHORIZED_ISSUING_ACCOUNTS: 'addAuthorizedIssuingAccounts',
  SET_PROPERTY_PERMISSIONS: 'setPropertyPermissions',
  UPDATE_PROPERTY_DEFINITION: 'updatePropertyDefinition',
  ENABLE_DELEGATION: 'enableDelegation',
  UNDELEGATE: 'undelegate',
  UNDELEGATE_START: 'undelegateStart',
  UNDELEGATE_DONE: 'undelegateDone',
  CHECK_PENDING_UNDELEGATIONS: 'checkPendingUndelegations',
};

const InflationContract = {
  ISSUE_NEW_TOKENS: 'issueNewTokens',
};

const NftMarketContract = {
  ENABLE_MARKET: 'enableMarket',
  BUY: 'buy',
  SELL: 'sell',
  CANCEL: 'cancel',
  CHANGE_PRICE: 'changePrice',
  HIT_SELL_ORDER: 'hitSellOrder',
  SELL_ORDER: 'sellOrder',
  CANCEL_ORDER: 'cancelOrder',
  SET_MARKET_PARAMS: 'setMarketParams',
};

module.exports.Contracts = Contracts;
module.exports.MarketContract = MarketContract;
module.exports.TokensContract = TokensContract;
module.exports.WitnessesContract = WitnessesContract;
module.exports.HivePeggedContract = HivePeggedContract;
module.exports.MiningContract = MiningContract;
module.exports.NftContract = NftContract;
module.exports.InflationContract = InflationContract;
module.exports.NftMarketContract = NftMarketContract;
