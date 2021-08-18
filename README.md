# Optimism Token List

The Optimism token list is used as the source of truth for the [Optimism Gateway](https://gateway.optimism.io/) which is the main portal for moving assets between Layer 1 and Layer 2.

## Contributing guide

To add your token to the token list, you need to complete the following:

- Deploy a compliant L2 token - details here https://community.optimism.io/docs/developers/bridge/standard-bridge.html#adding-an-erc20-token-to-the-standard-bridge
- Have a kovan test token instance that is representative of your L1 token
- Grant our test account `0xe3a90926133fef3c58514fA1aAeF75E0998aedD5` permissions to mint tokens for testing on kovan

Once you have completed testing and the above steps, you can submit a PR providing the addresses of the L1/L2 token pairs on both kovan and mainnet as well as a point of contact (email, telegram).