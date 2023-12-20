import fs from 'fs'
import path from 'path'
import { URLSearchParams } from 'url'

import { glob } from 'glob'
import fetch from 'node-fetch'
import { Validator } from 'jsonschema'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { schema } from '@uniswap/token-lists'
import { ethers } from 'ethers'
import { sleep } from '@eth-optimism/core-utils'
import { getContractInterface } from '@eth-optimism/contracts'

import { generate } from './generate'
import { TOKEN_DATA_SCHEMA } from './schemas'
import {
  L2_STANDARD_BRIDGE_INFORMATION,
  L2_TO_L1_PAIR,
  NETWORK_DATA,
} from './chains'
import { TOKEN_ABI } from './abi'
import {
  Chain,
  ExpectedMismatches,
  L2Chain,
  TokenData,
  ValidationResult,
} from './types'
import { fetchTokenlist } from './types/TokenList'
import { validateDataJson } from './validateDataJson'
import { validateLogo } from './validateLogo'
import { TokenDataJson } from './types/TokenDataJson'

/**
 * Validates a token list data folder.
 *
 * @param datadir Directory containing data files.
 * @param tokens List of tokens to run validation on.
 *
 * @return Validation results.
 */
export const validate = async (
  tokens: string[],
  datadir: string = path.join(__dirname, '..', 'data')
): Promise<ValidationResult[]> => {
  const folders = fs
    .readdirSync(datadir)
    .sort((a, b) => {
      return a.toLowerCase().localeCompare(b.toLowerCase())
    })
    .filter((folder) => {
      return !tokens || tokens.includes(folder)
    })

  const results = []

  const coinGeckoTokenList = await fetchTokenlist().catch(e => {
    results.push({
      type: 'warning',
      message: `Failed to fetch token list from CoinGecko`,
      cause: e
    })
  })

  for (const folder of folders) {
    const datafile = path.join(datadir, folder, 'data.json')
    if (!fs.existsSync(datafile)) {
      results.push({
        type: 'error',
        message: `data file ${datafile} does not exist`,
      })
      continue
    }

    // Load the data now that we know it exists
    const dataJson: TokenDataJson | undefined = await validateDataJson(folder).catch((e) => {
      results.push({
        type: 'error',
        message: `data file ${datafile} is invalid`,
        cause: e,
      })
      return undefined
    })

    const logoFilePaths = validateLogo(folder).catch((e) => {
      results.push({
        type: 'error',
        message: `logo for ${folder} is invalid`,
        cause: e,
      })
    })

    const expectedMismatchesFilePath = path.join(
      datadir,
      folder,
      'expectedMismatches.json'
    )
    const expectedMismatches: ExpectedMismatches = fs.existsSync(
      expectedMismatchesFilePath
    )
      ? JSON.parse(fs.readFileSync(expectedMismatchesFilePath, 'utf8'))
      : {}

    // Validate each token configuration
    for (const [chain, token] of Object.entries(dataJson?.tokens)) {
      // Validate any standard tokens
      if (folder !== 'ETH' && dataJson.nonstandard !== true) {
        const networkData = NETWORK_DATA[chain as Chain]
        const contract = new ethers.Contract(
          token.address,
          TOKEN_ABI,
          networkData.provider
        )

        // Check that the token exists on this chain
        if ((await contract.provider.getCode(token.address)) === '0x') {
          results.push({
            type: 'error',
            message: `${folder} on chain ${chain} token ${token.address} does not exist`,
          })
        }

        // Check that the token has the correct decimals
        if (token.overrides?.decimals === undefined) {
          try {
            if (data.decimals !== (await contract.decimals())) {
              results.push({
                type: 'error',
                message: `${folder} on chain ${chain} token ${token.address} has incorrect decimals`,
              })
            }
          } catch (err) {
            results.push({
              type: 'error',
              message: `${folder} on chain ${chain} token ${token.address} failed to get decimals`,
            })
          }
        } else {
          results.push({
            type: 'warning',
            message: `${folder} on chain ${chain} token ${token.address} has overridden decimals`,
          })
        }

        // Check that the token has the correct symbol
        if (token.overrides?.symbol === undefined) {
          try {
            if (
              data.symbol !== (await contract.symbol()) &&
              expectedMismatches.symbol !== data.symbol
            ) {
              results.push({
                type: 'error',
                message: `${folder} on chain ${chain} token ${token.address} has incorrect symbol`,
              })
            }
          } catch (err) {
            results.push({
              type: 'error',
              message: `${folder} on chain ${chain} token ${token.address} failed to get symbol`,
            })
          }
        } else {
          results.push({
            type: 'warning',
            message: `${folder} on chain ${chain} token ${token.address} has overridden symbol`,
          })
        }

        // Check that the token has the correct name
        if (token.overrides?.name === undefined) {
          try {
            if (
              data.name !== (await contract.name()) &&
              expectedMismatches.name !== data.name
            ) {
              results.push({
                type: 'error',
                message: `${folder} on chain ${chain} token ${token.address} has incorrect name`,
              })
            }
          } catch (err) {
            results.push({
              type: 'error',
              message: `${folder} on chain ${chain} token ${token.address} failed to get name`,
            })
          }
        } else {
          results.push({
            type: 'warning',
            message: `${folder} on chain ${chain} token ${token.address} has overridden name`,
          })
        }

        // Check that the Ethereum token exists in the CG token list
        if (chain === 'ethereum' && cg !== undefined) {
          const found = cg.tokens.find((t) => {
            return t.address.toLowerCase() === token.address.toLowerCase()
          })

          // Trigger manual review if the Ethereum token is not in the CG token list
          if (!found) {
            results.push({
              type: 'warning',
              message: `${folder} on chain ${chain} token ${token.address} not found on CoinGecko token list`,
            })
          }
        }

        if (networkData.layer === 2) {
          if (!data.nobridge) {
            if (token.overrides?.bridge === undefined) {
              try {
                const tokenContract = new ethers.Contract(
                  token.address,
                  getContractInterface('L2StandardERC20'),
                  networkData.provider
                )

                const l2Bridge = (await tokenContract.l2Bridge()) as string
                // Trigger review if the bridge for the token is not set
                // to the standard bridge address.
                if (
                  l2Bridge?.toUpperCase() !==
                  L2_STANDARD_BRIDGE_INFORMATION[
                    chain as L2Chain
                  ].l2StandardBridgeAddress.toUpperCase()
                ) {
                  results.push({
                    type: 'error',
                    message: `${folder} on chain ${chain} token ${token.address} not using standard bridge`,
                  })
                }

                const l1Token = (await tokenContract.l1Token()) as string
                const l1Chain = L2_TO_L1_PAIR[chain as Chain]
                const l1ChainData = data.tokens[l1Chain]
                if (
                  l1ChainData &&
                  l1ChainData.address.toUpperCase() !== l1Token.toUpperCase()
                ) {
                  results.push({
                    type: 'error',
                    message: `${folder} on chain ${chain} token ${token.address} does not match L1 token address`,
                  })
                }
              } catch (e) {
                console.error(
                  `${folder} on chain ${chain} token ${token.address} could not fetch l2Bridge or l1Token`,
                  e
                )
                results.push({
                  type: 'error',
                  message: `${folder} on chain ${chain} token ${token.address} could not fetch l2Bridge or l1Token.
                    This token most likely needs nobridge or a bridge override set.`,
                })
              }
            } else {
              results.push({
                type: 'warning',
                message: `${folder} on chain ${chain} token ${token.address} has an overridden bridge`,
              })
            }
          }
        } else {
          try {
            // Make sure the token is verified on Etherscan.
            // Etherscan API is heavily rate limited, so sleep for 1s to avoid errors.
            await sleep(1000)
            const { result: etherscanResult } = await (
              await fetch(
                `https://api${chain === 'ethereum' ? '' : `-${chain}`
                }.etherscan.io/api?` +
                new URLSearchParams({
                  module: 'contract',
                  action: 'getsourcecode',
                  address: token.address,
                  // If we ever get rate limited by etherscan uncomment this line and add a method for
                  // fetching the appropriate etherscan api key based on the chain.
                  // https://linear.app/optimism/issue/FE-1396
                  // apikey: getEtherscanApiKey(),
                })
              )
            ).json()

            // Trigger review if code not verified on Etherscan
            if (
              etherscanResult[0].ABI === 'Contract source code not verified'
            ) {
              results.push({
                type: 'warning',
                message: `${folder} on chain ${chain} token ${token.address} code not verified on Etherscan`,
              })
            }
          } catch (e) {
            console.error(
              `unable to fetch etherscan ${folder} on chain ${chain} token ${token.address}`,
              e
            )
            results.push({
              type: 'warning',
              message: `Etherscan API request failed for ${folder} on chain ${chain} token ${token.address}`,
            })
          }
        }
      } else {
        results.push({
          type: 'warning',
          message: `${folder} on chain ${chain} token ${token.address} is a nonstandard token`,
        })
      }
    }
  }

  // Verify that the final generated token list is valid
  const list = generate(datadir)
  const ajv = new Ajv({ allErrors: true, verbose: true })
  addFormats(ajv)
  const validator = ajv.compile(schema)
  if (!validator(list)) {
    results.push({
      type: 'error',
      message: `final token list is invalid: ${JSON.stringify(
        validator.errors,
        null,
        2
      )}`,
    })
  }

  return results
}
