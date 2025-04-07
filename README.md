# Superchain Token List

The Superchain token list is a list of tokens managed by the maintainers of this repo that have been deployed on Superchains including the OP Mainnet and Base. It serves as a source of truth for services such as the [Optimism bridge UI](https://app.optimism.io/bridge).

It is worth noting that the Superchain Token List makes a distinction between token deployment / bridging and list curation. Tokens can be deployed / bridged in a permissionless manner, [anyone can deploy / bridge a token](https://github.com/ethereum-optimism/optimism-tutorial/tree/01e4f94fa2671cfed0c6c82257345f77b3b858ef/standard-bridge-standard-token) on the Superchain.

Please note that by adding a token to the list we aren’t making any claims about the token itself; tokens are not reviewed for their quality, merits, or soundness as investments.

## Review process and merge criteria

### Process overview

1. Follow the instructions below to create a PR that would [add your token to the list](#adding-a-token-to-the-list).
2. Wait for a reviewer to kick off the [automated checks](#automated-checks).
3. After the automated checks pass and a reviewer approves the PR, then it will automatically be merged.

**Note:** The standard bridge does *not* support certain ERC-20 configurations:

- [Fee on transfer tokens](https://github.com/d-xo/weird-erc20#fee-on-transfer)
- [Tokens that modify balances without emitting a Transfer event](https://github.com/d-xo/weird-erc20#balance-modifications-outside-of-transfers-rebasingairdrops)

### Specifying chains

For right now, each OP Chain has their own review process. So, if you are adding tokens across multiple chains, please separate your pull request so that you have one PR for each chain, in order to streamline the review process.

- If you're adding a token to `Base` (e.g. `base` [mainnet] or `base-sepolia` [testnet]), instead of using the predeploy token factory on Base, we recommend you use the token factory [listed here](https://docs.base.org/base-contracts/#l2-contract-addresses) to avoid having a token address that may conflict with a different token on Optimism.
- If you are adding a token to `Zora`: please use the [`zora` label](https://github.com/ethereum-optimism/ethereum-optimism.github.io/labels/zora) and add [@tbtstl](https://github.com/tbtstl) as a reviewer.
- If you are adding a token to `Mode`: please use the [`mode` label](https://github.com/ethereum-optimism/ethereum-optimism.github.io/labels/mode).
- If you are adding a token to `Lisk` (e.g. `lisk` [mainnet] or `lisk-sepolia` [testnet]): please use the [`lisk` label](https://github.com/ethereum-optimism/ethereum-optimism.github.io/labels/lisk) and add [@shuse2](https://github.com/shuse2) as a reviewer.
- If you are adding a token to `Soneium` (e.g. `soneium` [mainnet] or `soneium-minato` [testnet]): please use the [`soneium` label](https://github.com/ethereum-optimism/ethereum-optimism.github.io/labels/soneium).

### Automated checks

Our CI performs a series of automated checks on every PR.
These automated checks take place as part of the `Validate PR` check.
Some issues raised by CI will trigger an error and must be resolved before your PR will be approved.
These issues are marked below as "auto-reject" issues.
Other issues will surface a warning, and will require a manual review from a reviewer.
These issues are marked below as "requires manual review".

- Given tokens actually exist on all specified chains (auto-reject)
- L1 tokens are verified on Etherscan (auto-reject)
- Description is under 1000 characters (auto-reject)
- Token `name`, `symbol`, and `decimals` matches on-chain data (auto-reject)
  - If `overrides` are used (requires manual review)
- L2 token was deployed by the [StandardTokenFactory](https://github.com/ethereum-optimism/optimism-legacy/blob/develop/packages/contracts/contracts/L2/messaging/L2StandardTokenFactory.sol) or is an [L2StandardERC20](https://github.com/ethereum-optimism/optimism-legacy/blob/develop/packages/contracts/contracts/standards/L2StandardERC20.sol) token that uses the standard L2 bridge address (`0x4200000000000000000000000000000000000010`) (requires manual review)
- Ethereum token listed on the [CoinGecko Token List](https://tokenlists.org/token-list?url=https://tokens.coingecko.com/uniswap/all.json)(requires manual review)
  - *Why CoinGecko? CoinGecko's token list updates every hour which means we get token list updates very quickly. CoinGecko also uses an in-depth [listing criteria](https://www.coingecko.com/en/methodology).*

#### Debugging Automated checks failures

If your automated checks failed, you can see the reason for the failure by downloading `validation-artifacts.zip`, unzipping it and opening the `validation_results.txt` file. To locate the `validation-artifacts` follow these steps:

1. Click on the `Details` link for `Validate PR` check in your PR
2. Click `Summary` in the left panel
3. Find the section on the page labeled `Artifacts` and click on `validation-artifacts`
4. After download of `validation-artifacts.zip`, unzip it and open `validation_results.txt`

If you make changes and need to run the validation check again, you will need to wait for a reviewer to approve the checks to run again. However, if you do not want to wait for a reviewer to approve the checks to run again to see if the failures have been resolved, you can run the validation checks locally by running:

```sh
npx tsx ./bin/cli.ts validate --datadir ./data --tokens <data folder name (e.g. ETH)>
```

### Final approval

All PRs are subject to a light-weight final approval, even if not marked as `requires manual review`.

## Adding a token to the list

### Create a folder for your token

Create a folder inside of the [data folder](https://github.com/ethereum-optimism/ethereum-optimism.github.io/tree/master/data) with the same name as the symbol of the token you are trying to add. For example, if you are adding a token with the symbol "ETH" you must create a folder called ETH.

### Add a logo to your folder

Add a logo to the data folder you just created. Your logo MUST be an SVG called `logo.svg`. Your logo should be at least 200x200 pt minimum and 256x256 pt preferred.

### Create a data file

Add a file to your folder called `data.json` with the following format:

```json
{
  "name": "Token Name",
  "symbol": "SYMBOL",
  "decimals": 18,
  "description": "A multi-chain token",
  "website": "https://token.com",
  "twitter": "@token",
  "tokens": {
    "ethereum": {
      "address": "0x1234123412341234123412341234123412341234"
    },
    "optimism": {
      "address": "0x2345234523452345234523452345234523452345"
    },
    "sepolia": {
      "address": "0x5678567856785678567856785678567856785678"
    },
    "optimism-sepolia": {
      "address": "0x6789678967896789678967896789678967896789"
    },
    "base": {
      "address": "0x7890789078907890789078907890789078907890"
    },
    "base-sepolia": {
      "address": "0x1011121011121011121011121011121011121011"
    }
  }
}
```

Please include the token addresses for *all* of the below chains where the token you are submitting has been deployed.
We currently accept tokens on the following chains:

- `ethereum`
- `optimism`
- `sepolia`
- `base`
- `base-sepolia`
- `optimism-sepolia`
- `mode`
- `lisk`
- `lisk-sepolia`
- `redstone`
- `metall2`
- `metall2-sepolia`

#### Non-bridgeable tokens

If you would like to add your token to this token list but you do not want your token to be included on the Optimism Bridge app, please include the `nobridge` option.

```json
{
  "name": "Token Name",
  "symbol": "SYMBOL",
  "decimals": 18,
  "description": "A multi-chain token",
  "website": "https://token.com",
  "twitter": "@token",
  "nobridge": true,
  "tokens": {
    ...
  }
}
```

#### Non-standard tokens

If your token is not a standard ERC20 (e.g., DSToken), please include the `nonstandard` option.

```json
{
  "name": "Token Name",
  "symbol": "SYMBOL",
  "decimals": 18,
  "description": "A multi-chain token",
  "website": "https://token.com",
  "twitter": "@token",
  "nonstandard": true,
  "tokens": {
    ...
  }
}
```

#### Per-token overrides

If you require overrides for specific tokens, you can include the `overrides` field. You are able to override the `name`, `symbol`, `decimals`, or `bridge` for any token. You do not need to override every token at the same time.

```json
{
  "name": "Token Name",
  "symbol": "SYMBOL",
  "decimals": 18,
  "description": "A multi-chain token",
  "website": "https://token.com",
  "twitter": "@token",
  "tokens": {
    "ethereum": {
      "address": "0x1234123412341234123412341234123412341234",
      "overrides": {
        "name": "My Ethereum Token"
      }
    },
    "optimism": {
      "address": "0x2345234523452345234523452345234523452345",
      "overrides": {
        "bridge": "0x1111111111111111111111111111111111111111"
      }
    }
  }
}
```

##### Bridge overrides

To override an L1 bridge address, specify the L2 chain it bridges to along with the address of the L1 bridge. For an L2 bridge address override, just specify the address of the L2 bridge.

Here is an example:

```json
{
  "name": "Synthetix",
  "symbol": "SNX",
  "decimals": 18,
  "tokens": {
    "ethereum": {
      "address": "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
      "overrides": {
        "bridge": {
          "optimism": "0x39Ea01a0298C315d149a490E34B59Dbf2EC7e48F"
        }
      }
    },
    "optimism": {
      "address": "0x8700daec35af8ff88c16bdf0418774cb3d7599b4",
      "overrides": {
        "bridge": "0x136b1EC699c62b0606854056f02dC7Bb80482d63"
      }
    },
    "sepolia": {
      "address": "0x51f44ca59b867E005e48FA573Cb8df83FC7f7597",
      "overrides": {
        "bridge": {
          "optimism-sepolia": "0x1427Bc44755d9Aa317535B1feE38922760Aa4e65"
        }
      }
    },
    "optimism-sepolia": {
      "address": "0x2E5ED97596a8368EB9E44B1f3F25B2E813845303",
      "overrides": {
        "bridge": "0xD2b3F0Ea40dB68088415412b0043F37B3088836D"
      }
    }
  }
}
```

### Create a pull request

Open a [pull request](https://github.com/ethereum-optimism/ethereum-optimism.github.io/pulls) with the changes that you've made. Please only add one token per pull request to simplify the review process. This means two new files inside of one new folder. If you want to add multiple tokens, please open different PRs for each token.

### Respond to validation checks

Your pull request will be validated by a series of automated checks. If one of these checks fails, please resolve these issues and make sure that validation succeeds. We will review your pull request for final approval once automated validation succeeds.

### Wait for the token list to update automatically

Once your PR is merged, the token list will update automatically to include your token. Please do NOT update the token list (`optimism.tokenlist.json`) directly. All token list updates will be handled automatically when PRs are merged into the `master` branch.

Note that [the bridge UI](https://app.optimism.io/bridge/deposit) is updated approximately once every work day, so it might take a day (or three in the case of an update on Friday) until your token is available there.
