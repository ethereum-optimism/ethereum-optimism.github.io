# Optimism Token List

The Optimism token list is used as the source of truth for the [Optimism Gateway](https://gateway.optimism.io/) which is the main portal for moving assets between Layer 1 and Layer 2.

## Adding a token to the list

To add a token to the token list, we'll need the following:

- Token logo image - the asset should be a PNG of 200x200 pt minimum, preferably 256x256 pt. This should be added to the [logos](https://github.com/ethereum-optimism/ethereum-optimism.github.io/tree/master/logos) folder. 
- A kovan test token instance that is representative of the L1 token.
- A compliant L2 token - details how to add one are here https://community.optimism.io/docs/developers/bridge/standard-bridge.html#adding-an-erc20-token-to-the-standard-bridge
- Grant our test account `0xe3a90926133fef3c58514fA1aAeF75E0998aedD5` permissions to mint tokens for testing on kovan or transfer us an amount we can use.

Once you have completed testing and the above steps, you can submit a PR providing the addresses of the L1/L2 token pairs on both kovan and mainnet. Note that all contracts should be verified in Etherscan. If you're looking for an example to follow, take a look at [this simple pull request that adds a token to the token list](https://github.com/ethereum-optimism/ethereum-optimism.github.io/pull/59/files).
