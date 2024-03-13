import fs from 'fs'
import path from 'path'

import { glob } from 'glob'

import { version } from '../package.json'
import {
  L1_STANDARD_BRIDGE_INFORMATION,
  L2_STANDARD_BRIDGE_INFORMATION,
  NETWORK_DATA,
} from './chains'
import { L2Chain, Token, TokenData, isL1Chain, isL2Chain } from './types'
import { defaultTokenDataFolders } from './defaultTokens'

/**
 * Base URL where static assets are hosted.
 */
const BASE_URL = 'https://ethereum-optimism.github.io'

/**
 * Generates a token list from the data in the data folder.
 *
 * @param datadir Directory containing data files.
 *
 * @returns Generated token list JSON object.
 */
export const generate = (datadir: string) => {
  return fs
    .readdirSync(datadir)
    .sort((a, b) => {
      return a.toLowerCase().localeCompare(b.toLowerCase())
    })
    .map((folder) => {
      const data: TokenData = JSON.parse(
        fs.readFileSync(path.join(datadir, folder, 'data.json'), 'utf8')
      )
      const logofiles = glob.sync(
        `${path.join(datadir, folder)}/logo.{png,svg}`
      )
      const logoext = logofiles[0].endsWith('png') ? 'png' : 'svg'
      return Object.entries(data.tokens).map(([chain, token]) => {
        const bridges = !data.nobridge
          ? Object.assign({}, ...getBridges(data, chain, token))
          : {}
        const out = {
          chainId: NETWORK_DATA[chain].id,
          address: token.address,
          name: token.overrides?.name ?? data.name,
          symbol: token.overrides?.symbol ?? data.symbol,
          decimals: token.overrides?.decimals ?? data.decimals,
          logoURI: `${BASE_URL}/data/${folder}/logo.${logoext}`,
          extensions: {
            ...bridges,
            opListId: defaultTokenDataFolders.has(folder.toUpperCase())
              ? 'default'
              : 'extended',
            opTokenId: folder,
          },
        }
        return out
      })
    })
    .reduce(
      (list, tokens) => {
        list.tokens = list.tokens.concat(tokens)
        return list
      },
      {
        name: 'Superchain Token List',
        logoURI: `${BASE_URL}/optimism.svg`,
        keywords: ['scaling', 'layer2', 'infrastructure'],
        timestamp: new Date().toISOString(),
        tokens: [],
        version: {
          major: parseInt(version.split('.')[0], 10),
          minor: parseInt(version.split('.')[1], 10),
          patch: parseInt(version.split('.')[2], 10),
        },
      }
    )
}

// Function to get bridge information based on token data, chain, and token
const getBridges = (tokenData, chain, token) => {
 // Check if the chain is an L2 chain
 if (isL2Chain(chain)) {
    // Check for a token bridge override and ensure it's a string
    const tokenBridgeOverride = token.overrides?.bridge;
    if (tokenBridgeOverride && typeof tokenBridgeOverride !== 'string') {
      throw new Error('L2 Bridge override should be a string');
    }
    // Extract the chain name and construct the bridge key
    const networkSep = chain.indexOf('-');
    const chainName = networkSep === -1 ? chain : chain.slice(0, networkSep);
    const bridgeKey = `${chainName}BridgeAddress`;
    // Return the bridge information with the override or default address
    return [
      {
        [bridgeKey]: tokenBridgeOverride ?? L2_STANDARD_BRIDGE_INFORMATION[chain].l2StandardBridgeAddress,
      },
    ];
 }

 // Check if the chain is an L1 chain
 if (isL1Chain(chain)) {
    // Get the L2 chains supported by the L1 chain
    const l2ChainsForL1 = L1_STANDARD_BRIDGE_INFORMATION[chain].map((l1Bridge) => l1Bridge.l2Chain);
    const l2ChainsSupported = Object.entries(tokenData.tokens)
      .filter(([tokenChain]) => isL2Chain(tokenChain) && l2ChainsForL1.includes(tokenChain))
      .map(([l2Chain]) => l2Chain);
    // Return the bridge information for each supported L2 chain
    return l2ChainsSupported.map((l2Chain) => {
      const l1StandardBridgeInfoForL2 = L1_STANDARD_BRIDGE_INFORMATION[chain].find((l1BridgeInfo) => l1BridgeInfo.l2Chain === l2Chain);
      // Check for a token bridge override and ensure it's a map from L2 chain to bridge address
      const tokenBridgeOverride = token.overrides?.bridge;
      if (tokenBridgeOverride && typeof tokenBridgeOverride === 'string') {
        throw new Error('L1 Bridge override should be a map from L2 chain to bridge address');
      }
      // Extract the chain name and construct the bridge key
      const networkSep = l2Chain.indexOf('-');
      const chainName = networkSep === -1 ? l2Chain : l2Chain.slice(0, networkSep);
      const bridgeKey = `${chainName}BridgeAddress`;
      // Return the bridge information with the override or default address
      return {
        [bridgeKey]: tokenBridgeOverride?.[l2Chain] ?? l1StandardBridgeInfoForL2.l1StandardBridgeAddress,
      };
    });
 }
};

  throw new Error('unsupported chain')
}
