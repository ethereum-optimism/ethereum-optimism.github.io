const fs = require('fs')
const path = require('path')
const glob = require('glob')
const assert = require('assert')
const Validator = require('jsonschema').Validator

const { TOKEN_DATA_SCHEMA } = require('./schemas')

const main = async () => {
  const datadir = path.resolve(__dirname, '../data/')
  fs.readdirSync(datadir)
    .map((folder) => {
      const datafile = path.join(datadir, folder, 'data.json')
      assert(fs.existsSync(datafile), `${datafile} does not exist (${folder})`)

      const data = require(datafile)
      const v = new Validator()
      console.log(v.validate(data, TOKEN_DATA_SCHEMA).errors)

      const logofiles = glob.sync(`${path.join(datadir, folder)}/logo.{png,svg}`)
      assert(logofiles.length === 1, `must have exactly one logo file (${folder})`)
    })
}

main()
