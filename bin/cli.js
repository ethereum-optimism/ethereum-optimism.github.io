const fs = require("fs");

const { Command } = require("commander");

const { generate } = require("../src/generate");
const { validate } = require("../src/validate");

const program = new Command()

program
  .name('optl')
  .description('CLI for generating and validating tokenlists')
  .version(require('../package.json').version)

program
  .command('validate')
  .description('Validate tokenlist data files')
  .requiredOption('--datadir <datadir>', 'Directory containing data files')
  .option('--tokens <tokens>', 'Comma-separated list of tokens symbols to validate')
  .action(async (options) => {
    const results = await validate(options.datadir, options.tokens.split(','));

    const errs = results.filter(r => r.type === 'error');
    if (errs.length > 0) {
      for (const err of errs) {
        console.error(`error: ${err.message}`);
      }

      // Exit with error code so CI fails
      process.exit(1);
    }

    const warns = results.filter(r => r.type === 'warning');
    if (warns.length > 0) {
      for (const warn of warns) {
        console.log(`warning: ${warn.message}`);
      }
    }
  })

program
  .command('generate')
  .description('Generates a tokenlist data file')
  .requiredOption('--datadir <datadir>', 'Directory containing data files')
  .requiredOption('--outfile <outfile>', 'Output file to write')
  .action(async (options) => {
    const list = generate(options.datadir);
    fs.writeFileSync(options.outfile, JSON.stringify(list, null, 2));
  })

program.parse();
