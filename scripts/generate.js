const fs = require('fs')

const { generate } = require('../src/generate')

const main = async () => {
  const list = await generate()
  fs.writeFileSync('optimism.tokenlist.json', JSON.stringify(list, null, 2))
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
