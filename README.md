# Hive Smart Contracts history

The new version is available at https://accounts.hive-engine.com/

## Configuration (config.json)

The configuration allows you to define contracts that should be ignored:

```
"ignoreContracts": ["nft", "nftmarket"]
```

which currently may contain one of `airdrops, botcontroller, claimdrops, crittermanager, dice, distribution, hivepegged, inflation, market, marketmaker, marketpools, mining, nft, nftmarket, packmanager, sscstore, tokens, witnesses`.

You may also define token or nft symbols that should be ignored:

```
"ignoreSymbols": ["CITY"]
```

which may be any of the available token or nft symbols.

## API Usage

### Tokens History

The `accountHistory` API is available under the endpoint:

```
https://accounts.hive-engine.com/accountHistory
```

#### GET Parameters

- `account`: a HIVE account (required)
- `symbol`: a Hive-Engine token symbol (optional)
- `timestampStart`: a unix timestamp that represents the start of the dataset (optional)
- `timestampEnd`: a unix timestamp that represents the end of the dataset (optional)
- `limit`: number of records for the dataset (max is 500) (optional)
- `offset`: offset for the dataset (required to browse a dataset that is bigger than 500 records) (optional)

#### Examples

- `https://accounts.hive-engine.com/accountHistory?account=hive-eng`
- `https://accounts.hive-engine.com/accountHistory?account=hive-eng&symbol=BEE`
- `https://accounts.hive-engine.com/accountHistory?account=hive-eng&symbol=BEE&timestampStart=1554085536&timestampEnd=1564748055`
- `https://accounts.hive-engine.com/accountHistory?account=hive-eng&symbol=BEE&timestampStart=1554085536&timestampEnd=1564748055&limit=1&offset=1`

#### Available operations

##### Tokens contract

- `tokens_create`: a token was created
- `tokens_issue`: tokens were issued
- `tokens_transfer`: tokens were transfered between accounts
- `tokens_transferToContract`: tokens were transfered from an account to a contract
- `tokens_transferFromContract`: tokens were transfered from a contract to an account
- `tokens_updatePrecision`: the precision of a token was updated
- `tokens_updateUrl`: the url of a token was updated
- `tokens_updateMetadata`: the metadata of a token was updated
- `tokens_transferOwnership`: the ownership of a token was transfered
- `tokens_enableStaking`: staking was enabled for a token
- `tokens_enableDelegation`: delegation was enabled for a token
- `tokens_stake`: tokens were staked
- `tokens_unstakeStart`: an unstake was started
- `tokens_cancelUnstake`: an unstake was canceled
- `tokens_unstake`: tokens were unstaked
- `tokens_delegate`: tokens were delegated
- `tokens_undelegateStart`: an undelegation was started
- `tokens_undelegateDone`: an undelegation was completed

##### Market contract

- `market_cancel`: an order was canceled
- `market_placeOrder`: an order was placed
- `market_expire`: an order expired
- `market_buy`: tokens were bought
- `market_sell`: tokens were sold
- `market_close`: an order was closed


##### Mining contract

- `mining_lottery`: lottery was won

##### Witnesses contract

- `witnesses_proposeRound`: witness rewards for proposing a new round

##### Hivepegged contract

- `hivepegged_buy`: SWAP.HIVE was deposited
- `hivepegged_withdraw`: SWAP.HIVE was withdrawn

##### Inflation contract

- `inflation_issueNewTokens`: new BEE tokens were issued

##### Nft contract

- `nft_transfer`: nfts were transferred between accounts
- `nft_issue`: a new nft was issued
- `nft_issueMultiple`: new nfts were issued
- `nft_burn`: a nft was burned
- `nft_delegate`: a nft was delegated to another account
- `nft_undelegate`: an undelegation was started for a nft
- `nft_undelegateDone`: an undelegation was finished for a nft
- `nft_enableDelegation`: enable delegation for a nft symbol
- `nft_create`:  create a new nft symbol
- `nft_addAuthorizedIssuingAccounts`:  authorized issuing accounts were added to a nft
- `nft_setGroupBy`: group by was set for a nft symbol
- `nft_setProperties`: properties were set for a nft symbol
- `nft_addProperty`: a property was added to a nft
- `nft_setPropertyPermissions`:  property permissions were set for a nft symbol
- `nft_updatePropertyDefinition`: the property definition was updated for a nft
- `nft_updateUrl`:  the url of a nft was updated
- `nft_updateMetadata`:  the metadata of a nft was updated
- `nft_updateName`:  the name of a nft was updated
- `nft_updateOrgName`:  the org name of a nft was updated
- `nft_updateProductName`: the product name of a nft was updated

##### Nftmarket contract

- `nftmarket_buy`: an order was bought
- `nftmarket_sell`: list a new order
- `nftmarket_cancel`: cancel an order
- `nftmarket_changePrice`: change the price of an order



### Market History

The `marketHistory` API is available under the endpoint:

```
https://accounts.hive-engine.com/marketHistory
```

#### GET Parameters

- `symbol`: a Steem-Engine token symbol (required)
- `timestampStart`: a unix timestamp that represents the start of the dataset (optional)
- `timestampEnd`: a unix timestamp that represents the end of the dataset (optional)

#### Available data

- `volumeSteem`: volume of HIVE (SWAP.HIVE) traded
- `volumeToken`: volume of tokens traded
- `lowestPrice`: lowest price seen that day
- `highestPrice`: highest price seen that day

#### Examples

- `https://accounts.hive-engine.com/marketHistory?symbol=BEE`
- `https://accounts.hive-engine.com/marketHistory?symbol=BEE&timestampStart=1554163200&timestampEnd=1554422400`

