const { generate } = require('../src/generate')

const main = async () => {
  await generate()
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
