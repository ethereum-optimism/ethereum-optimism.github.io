import fs from 'fs'
import path from 'path'

import { glob } from 'glob'

import { version } from '../package.json'
import { NETWORK_DATA } from './chains'
import { TokenData } from './types'

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
        return {
          chainId: NETWORK_DATA[chain].id,
          address: token.address,
          name: token.overrides?.name ?? data.name,
          symbol: token.overrides?.symbol ?? data.symbol,
          decimals: token.overrides?.decimals ?? data.decimals,
          logoURI: `${BASE_URL}/data/${folder}/logo.${logoext}`,
          extensions: {
            optimismBridgeAddress:
              token.overrides?.bridge ?? NETWORK_DATA[chain].bridge,
          },
        }
      })
    })
    .reduce(
      (list, tokens) => {
        list.tokens = list.tokens.concat(tokens)
        return list
      },
      {
        name: 'Optimism',
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
