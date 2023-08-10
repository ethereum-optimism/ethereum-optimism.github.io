import { execSync } from 'child_process'

// Execute the git command to get a list of changed files since master
const changedFilesRaw = execSync('git diff --name-only master')
  .toString()
  .trim()
const changedFiles = changedFilesRaw.split('\n')

// Filter the changed files to only include ones that start with 'data/'
const dataChangedFiles = changedFiles.filter((file) => file.startsWith('data/'))

// Extract the tokens from the changed files
const tokens = dataChangedFiles
  .map((file) => {
    const match = /^data\/([^/]*)/.exec(file)
    return match ? match[1] : null
  })
  .filter(Boolean) // This will remove any null values

// Remove duplicates using Set
const uniqueTokens = [...new Set(tokens)]

// mapping of checks to remediation
const checks = {
  'pnpm lint:check':
    'Linter failed. Please run `pnpm lint:fix` and fix the errors and commit again.',
  'pnpm test':
    'Test failed. If you are just trying to commit a token this might be a bug in the tokenlist tests. Please notify a team member if stuck.',
  'pnpm build':
    'Failed to build the tokenlist. If youa re just tyring to commit a token this might be a bug in the tokenlist build. Please notify a team member if stuck.',
}

if (uniqueTokens.length === 0) {
  console.warn('No tokens changed. Skipping all token validation.')
} else {
  checks[`pnpm validate --datadir data --tokens ${uniqueTokens.toString()}`] =
    'Validation failed. Please check error messages and fix them before committing.'
}

console.log(
  `Validating tokenlist via running the following checks: ${Object.keys(
    checks
  ).join(',')}}`
)
Object.entries(checks).forEach(([check, remediation]) => {
  try {
    console.log(`Running ${check}...`)
    execSync(check, { stdio: 'inherit' })
  } catch (error) {
    console.error(`Error running ${check}`, error)
    console.error(remediation)
    process.exit(1)
  }
})

console.log('All checks passed. Ready to commit.')
