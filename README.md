# Steem Smart Contracts tokens history

Scans the Steem Smart Contracts blockchain (`history_builder.js`) to generate an index of historical 
transactions (generally transfers) that can easily be queried using GET queries to the 
NodeJS server `server.js`

Used by [Steem-Engine](https://steem-engine.com) for transaction history (endpoint: `https://api.steem-engine.com/accounts/history`)

Created and maintained by @harpagon210 [(Original Github Repo)](https://github.com/harpagon210/ssc_tokens_history)

Some additional contributions, including this README by @someguy123 / @privex [(Privex Fork)](https://github.com/Privex/ssc_tokens_history)

Released under the **MIT License** (See the file `LICENSE` for more info)

# API Usage + Libraries

By default, the application itself exposes a single endpoint on port 3000 `/history`

The official history API for https://steem-engine.com is aliased to `/accounts/history`:

```
https://api.steem-engine.com/accounts/history
```

An example GET query to view the most recent 5 transactions made by @someguy123 using the token `SGTK`:

```
curl -fsSL https://api.steem-engine.com/accounts/history?account=someguy123&limit=5&offset=0&type=user&symbol=SGTK
```

**GET Parameters:**

 - `account` - (required) Filter TXs to/from the username of a Steem account whom uses the SSC sidechain
 - `limit` - (optional) The amount of recent TXs to load (Default: `500`)
 - `offset` - (optional) For paginating, list transactions AFTER `offset` recent transactions (Default: `0`)
 - `type` - (optional) Either `user` (TXs triggered by the user) or `contract` (TXs triggered by a smart contract)
 - `symbol` - (optional) Only list transactions involving this token symbol, e.g. `ENG` or `STEEMP`

**Libraries for this API**

Python Libraries:

 - [Privex's Python Steem-Engine Library](https://github.com/Privex/python-steemengine) | `pip3 install privex-steemengine`


# Pre-requisites

 - **PostgreSQL 10** or newer is recommended
 - NodeJS (Last tested by @someguy123 on Node v10.16.2 LTS)

Install **PostgreSQL** if you don't already have it installed.

```sh
apt install -y postgresql postgresql-client postgresql-client-common
```

Install **NodeJS** 10 or higher with `nvm` if you don't already have it installed.

**Note:** You don't need to do this as root. For security, it's generally a good idea to create a Linux user just for this application, it doesn't require root. Install NVM and NodeJS under the user you plan to run SSC History under.

```sh
# Create the user `ssc` and disable log-in over SSH / Console for safety
root@myhost ~ # adduser --gecos "" --disabled-login ssc
# Change to the user `ssc` for any operations that don't require root.
root@myhost ~ # su - ssc

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

# Load NVM for the first time, since you've only just installed it.
export NVM_DIR="${XDG_CONFIG_HOME/:-$HOME/.}nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

# Install the latest LTS (Long term support) version of NodeJS + NPM
nvm install --lts
```



# Installation

Create a Postgres user and database to store the history data.

```sh
su - postgres

###
# As the postgres user:
###

# Create the PostgreSQL user 'steemssc' and set a password (save it somewhere, you'll need it for the config)
createuser -SDRl -P steemssc

# Create a database called 'steemssc' owned by the user 'steemssc'
createdb -O steemssc steemssc

exit
```

Now that you have PostgreSQL ready to use, clone the repo and install the NodeJS packages.

```sh
root@myhost ~ # su - ssc

# As the `ssc` user
git clone https://github.com/harpagon210/ssc_tokens_history.git
cd ssc_tokens_history
npm install
```

# Configuration

Inside of `ssc_tokens_history` you'll want to create a file called `.env` and fill it with the database connection details.

```sh
nano .env    # Use whatever text editor you prefer. Nano is the easiest
```

The contents of .env should look like this:

```env
DATABASE_URL=postgres://steemssc:ThePasswordYouSetEarlier@localhost:5432/steemssc
```

Save the file.

Next, you'll want to open up `config.json`.

```sh
nano config.json
```

The only thing you'll probably need to change is the list of RPC nodes. By default, it uses `https://testapi.steem-engine.com` which is for the testnet.

For the main network, you'll want to use `https://api.steem-engine.com/rpc` (or any other SSC RPC node of your choice).

```js
{
    "nodes": [
        "https://api.steem-engine.com/rpc"
    ],
    "lastSSCBlockParsed": 0,
    "port": 3000,
    "pollingTime": 1000
}
```

# Running + Final setup

Now that you've configured the application, you'll now need to create the schema.

As the user you've installed SSC History under:

```sh

# This will create the Postgres database schema for 'transactions' using
# the database connection details in the file '.env'

ssc@myhost ~/ssc_tokens_history $ node initDB.js
```

To confirm the database was created, log into `postgres` again, and check if the table exists.

```sh
root@myserver ~ # su - postgres

postgres@myserver ~ $ psql steemssc

steemssc=# \dt
            List of relations
 Schema |     Name     | Type  |  Owner
--------+--------------+-------+----------
 public | transactions | table | steemssc
(1 row)

```

Press `CTRL-D` to exit the postgres shell, and type `exit` to return to your user.

Now back to the history app.

It's time to start loading blocks into the database. Run `node history_builder.js` (it's best to do this in something like `tmux` or `screen` so it can run in the background)

```sh
ssc@myhost ~ $ cd ssc_tokens_history

ssc@myhost ~/ssc_tokens_history $ node history_builder.js
parsing block #1
parsing block #2
parsing block #3
```

If everything is working correctly, you'll see output like above with `parsing block #123`

To run the actual history server, run the following (in another terminal. leave history_builder.js running in the background)

```sh
ssc@myhost ~ $ cd ssc_tokens_history

ssc@myhost ~/ssc_tokens_history $ node server.js
```

The server will not output anything, but you can test that it's working by running a query using `curl` and `jq`

You don't have to wait for `history_builder.js` to finish loading all blocks, you'll just have outdated history information until it's fully synced.

(`jq` is optional, but it will make the output easier to read)

```sh
root@myhost ~ # apt install -y jq curl
# Request the most recent transaction
root@myhost ~ # curl -fsSL "http://localhost:3000/history?account=steemsc&limit=1" -o - | jq
[
  {
    "block": "1635",
    "txid": "dd7ee73d1c430c3455a996ba5e9036562614dcad",
    "timestamp": "2019-02-21T20:20:36.000Z",
    "symbol": "ENG",
    "from": "steemsc",
    "from_type": "user",
    "to": "charlie777pt",
    "to_type": "user",
    "memo": null,
    "quantity": "20"
  }
]
```

