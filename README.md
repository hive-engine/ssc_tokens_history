# Hive Smart Contracts history

This new version is available at https://accounts.hive-engine.com/

### Tokens History:

The parameters available are:
account: a HIVE account (required)
symbol: a Hive-Engine token symbol (optional)
timestampStart: a unix timestamp that represents the start of the dataset (optional)
timestampEnd: a unix timestamp that represents the end of the dataset (optional)
limit: number of records for the dataset (max is 500) (optional)
offset: offset for the dataset (required to browse a dataset that is bigger than 500 records) (optional)

Examples:

https://accounts.hive-engine.com/accountHistory?account=hive-eng
https://accounts.hive-engine.com/accountHistory?account=hive-eng&symbol=BEE
https://accounts.hive-engine.com/accountHistory?account=hive-eng&symbol=BEE&timestampStart=1554085536&timestampEnd=1564748055
https://accounts.hive-engine.com/accountHistory?account=hive-eng&symbol=BEE&timestampStart=1554085536&timestampEnd=1564748055&limit=1&offset=1

The different operations available in the history:

Tokens contract:

tokens_create: a token was created

tokens_issue: tokens were issued

tokens_transfer: tokens were transfered between accounts

tokens_transferToContract: tokens were transfered from an account to a contract

tokens_transferFromContract: tokens were transfered from a contract to an account

tokens_updatePrecision: the precision of a token was updated

tokens_updateUrl: the url of a token was updated

tokens_updateMetadata: the metadata of a token was updated

tokens_transferOwnership: the ownership of a token was transfered

tokens_enableStaking: staking was enabled for a token

tokens_enableDelegation: delegation was enabled for a token

tokens_stake: tokens were staked

tokens_unstakeStart: an unstake was started

tokens_cancelUnstake: an unstake was canceled

tokens_unstake: tokens were unstaked

tokens_delegate: tokens were delegated

tokens_undelegateStart: an undelegation was started

tokens_undelegateDone: an undelegation was completed


Market contract:

market_cancel: an order was canceled

market_placeOrder: an order was placed

market_expire: an order expired

market_buy: tokens were bought

market_sell: tokens were sold

market_close: an order was closed


Mining contract:

mining_lottery: lottery was won

### Market History:

The parameters available are:

symbol: a Steem-Engine token symbol (required)

timestampStart: a unix timestamp that represents the start of the dataset (optional)

timestampEnd: a unix timestamp that represents the end of the dataset (optional)

Data available:
volumeSteem: volume of HIVE (SWAP.HIVE) traded

volumeToken: volume of tokens traded

lowestPrice: lowest price seen that day

highestPrice: highest price seen that day

Examples:

https://accounts.hive-engine.com/marketHistory?symbol=BEE

https://accounts.hive-engine.com/marketHistory?symbol=BEE&timestampStart=1554163200&timestampEnd=1554422400
