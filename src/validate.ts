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

import { generate } from './generate'
import { TOKEN_DATA_SCHEMA } from './schemas'
import { NETWORK_DATA } from './chains'
import { FACTORY_ABI, TOKEN_ABI } from './abi'
import { TokenData, ValidationResult } from './types'

/**
 * Validates a token list data folder.
 *
 * @param datadir Directory containing data files.
 * @param tokens List of tokens to run validation on.
 *
 * @return Validation results.
 */
export const validate = async (
  datadir: string,
  tokens: string[]
): Promise<ValidationResult[]> => {
  // Load data files to validate and filter for requested tokens
  console.log(tokens)
  const folders = fs
    .readdirSync(datadir)
    .sort((a, b) => {
      return a.toLowerCase().localeCompare(b.toLowerCase())
    })
    .filter((folder) => {
      return !tokens || tokens.includes(folder)
    })

  // Load the CoinGecko tokenlist once to avoid additional requests
  const cgret = await fetch('https://tokens.coingecko.com/uniswap/all.json')
  const cg = await cgret.json()

  const results = []
  for (const folder of folders) {
    // Make sure the data file exists
    const datafile = path.join(datadir, folder, 'data.json')
    if (!fs.existsSync(datafile)) {
      results.push({
        type: 'error',
        message: `data file ${datafile} does not exist`,
      })
    }

    // Load the data now that we know it exists
    const data: TokenData = JSON.parse(fs.readFileSync(datafile, 'utf8'))

    // Make sure ONE logo file exists
    const logofiles = glob.sync(`${path.join(datadir, folder)}/logo.{png,svg}`)
    if (logofiles.length !== 1) {
      results.push({
        type: 'error',
        message: `${folder} has ${logofiles.length} logo files, make sure your logo is either logo.png OR logo.svg`,
      })
    }

    // Validate the data file
    const v = new Validator()
    const result = v.validate(data, TOKEN_DATA_SCHEMA as any)
    if (!result.valid) {
      for (const error of result.errors) {
        results.push({
          type: 'error',
          message: `${folder}: ${error.property}: ${error.message}`,
        })
      }

      // Since the data file is invalid, we can't continue validating the rest of the files
      continue
    }

    // Validate each token configuration
    for (const [chain, token] of Object.entries(data.tokens)) {
      // Check to make sure the website will load
      for (let i = 0; i < 5; i++) {
        try {
          await fetch(data.website)
          break
        } catch (err) {
          if (i < 4) {
            await sleep(5000)
          } else {
            results.push({
              type: 'error',
              message: `${folder} on chain ${chain} website did not load`,
            })
          }
        }
      }

      // Validate any standard tokens
      if (folder !== 'ETH' && data.nonstandard !== true) {
        const contract = new ethers.Contract(
          token.address,
          TOKEN_ABI,
          NETWORK_DATA[chain].provider
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
            if (data.symbol !== (await contract.symbol())) {
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
            if (data.name !== (await contract.name())) {
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
        if (chain === 'ethereum') {
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

        if (chain.startsWith('optimism')) {
          const factory = new ethers.Contract(
            '0x4200000000000000000000000000000000000012',
            FACTORY_ABI,
            NETWORK_DATA[chain].provider
          )

          const events = await factory.queryFilter(
            factory.filters.StandardL2TokenCreated(undefined, token.address)
          )

          // Trigger review if not created by standard token factory.
          if (events.length === 0) {
            results.push({
              type: 'warning',
              message: `${folder} on chain ${chain} token ${token.address} not created by standard token factory`,
            })
          }
        } else {
          // Make sure the token is verified on Etherscan.
          // Etherscan API is heavily rate limited, so sleep for 1s to avoid errors.
          await sleep(1000)
          const { qResult } = await (
            await fetch(
              `https://api${
                chain === 'ethereum' ? '' : `-${chain}`
              }.etherscan.io/api?` +
                new URLSearchParams({
                  module: 'contract',
                  action: 'getsourcecode',
                  address: token.address,
                  apikey: process.env.ETHERSCAN_API_KEY,
                })
            )
          ).json()

          // Trigger review if code not verified on Etherscan
          if (qResult[0].ABI === 'Contract source code not verified') {
            results.push({
              type: 'warning',
              message: `${folder} on chain ${chain} token ${token.address} code not verified on Etherscan`,
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
