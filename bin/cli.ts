import fs from 'fs'

import { Command } from 'commander'

import { generate } from '../src/generate'
import { validate } from '../src/validate'
import { version } from '../package.json'

const program = new Command()

program
  .name('optl')
  .description('CLI for generating and validating tokenlists')
  .version(version)

program
  .command('validate')
  .description('Validate tokenlist data files')
  .requiredOption('--datadir <datadir>', 'Directory containing data files')
  .option(
    '--tokens <tokens>',
    'Comma-separated list of token symbols to validate'
  )
  .action(async (options) => {
    const results = await validate(options.datadir, options.tokens.split(','))

    const validationResultsFilePath = 'validation_results.txt'
    const errs = results.filter((r) => r.type === 'error')
    const warns = results.filter((r) => r.type === 'warning')

    if (errs.length > 0 || warns.length > 0) {
      fs.writeFileSync(
        validationResultsFilePath,
        `Below are the results from running validation for the token changes. To ` +
          `re-run the validation locally run: ` +
          `pnpm validate --datadir ./data --tokens ${options.tokens}\n\n`
      )
    }

    if (errs.length > 0) {
      fs.appendFileSync(
        validationResultsFilePath,
        `These errors caused the validation to fail:\n${errs
          .map((err) => err.message)
          .join('\r\n')}\n\n`
      )
      for (const err of errs) {
        if (err.message.startsWith('final token list is invalid')) {
          // Message generated here is super long and doesn't really give more information than the
          // rest of the errors, so just print a short version of it instead.
          console.error(`error: final token list is invalid`)
        } else {
          console.error(`error: ${err.message}`)
        }
      }
    }

    if (warns.length > 0) {
      fs.appendFileSync(
        validationResultsFilePath,
        `These warnings were found during validation, but did not cause validation to fail:\n${warns
          .map((warn) => warn.message)
          .join('\r\n')}\n`
      )
      for (const warn of warns) {
        console.log(`warning: ${warn.message}`)
      }
    }

    if (errs.length > 0) {
      // Exit with error code so CI fails
      process.exit(1)
    }
  })

program
  .command('generate')
  .description('Generates a tokenlist data file')
  .requiredOption('--datadir <datadir>', 'Directory containing data files')
  .requiredOption('--outfile <outfile>', 'Output file to write')
  .action(async (options) => {
    const list = generate(options.datadir)
    fs.writeFileSync(options.outfile, JSON.stringify(list, null, 2))
  })

program.parse()
