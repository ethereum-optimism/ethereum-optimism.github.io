# ERC20 Standard Token Bridge 

Follow this process to get your token added to the token list. There are 5 simple steps to add your token to the list. 

1. Make a copy of [template.json](./template.json)
2. Fill in your project details
3. Add your token address for each chain
4. Validating your data
5. Add your token to the list 

Please follow each of these steps exactly as laid out in order to make your PR turn around time as fast as possible. Before following these steps please fork this repository (follow the steps in the base [README](../../README.md)).

### 1. Make a copy of [template.json](./template.json)
1. Duplicate [template.json](./template.json).
2. Rename the file to the name of your project. Name this file using camel case (i.e yourProject).

### 2. Fill in your project details
1. Fill in your projects name (should match file name).
2. Add your projects website. 
3. Add your projects twitter account. If your project does not have a twitter account, leave this field empty (i.e `"twitter": "",`).
4. Add a description for your project. This description cannot be longer than 150 characters. Your PR will fail if your description is too long. Please _describe_ what your project is/does/accomplishes. This is not a sales pitch. 

### 3. Add your token address for each chain
There are a few configurations that are valid, as shown below. Please take note that these listed configurations are the ONLY VALID CONFIGURATIONS. If your provided addresses do not match an accepted configuration your token will not be added to the list. 

You do not need to fill in the `name`, `symbol` and `decimals` for your tokens. These will be collected directly from the contracts. These properties MUST match across all chains (i.e the `name`, `symbol` and `decimals` of your token must be the same on L1 & L2 for mainnets and testnets).

Configuration | Ethereum Mainnet (1) | Optimism Mainnet (10) | Kovan Testnet (42) | Optimism Kovan Testnet (69) |
|:---|:---|:---|:---|:---|
| Standard token | ✅ Address provided | ✅ Address provided | ✅ Address provided | ✅ Address provided |
| L2 native token (unbridgeable) | ❌ No address provided | ✅ Address provided | ❌ No address provided | ✅ Address provided
| Token still under development/testing | ❌ No address provided | ❌ No address provided | ✅ Address provided | ✅ Address provided

### 4. Validating your data

Before you can add your token to the token list, you need to run the following validation script:

```
yarn validate yourProject.json
```

This will check the following:
* Your token exists on the specified chains
* Your token complies with the ERC20 standard
* The `name`, `symbol` and `decimals` for your token is the same on all chains (this will push this info into your file)
* Project info provided is valid 
    * Your description is under 150 char
    * Your website loads 
    * Your twitter link loads (unless it is blank)
* Your project does not already have an entry in the list (updates are done separately)

### 5. Add your token to the list 

To add your token to the list, run:

```
yarn addToken yourProject.json
```

Note that this runs the validation script and will only add your token if the validation passes. If you manually add your token to the list CI will fail your PR (and you will waste your time). 