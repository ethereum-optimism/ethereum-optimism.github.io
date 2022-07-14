const fs = require('fs')

const { generate } = require('../src/generate')

const main = async () => {
  const list = await generate()
  fs.writeFileSync('optimism.tokenlist.json', JSON.stringify(list, null, 2))
}

main()
