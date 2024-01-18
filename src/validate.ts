import { join } from "path"
import { DATA_DIR } from "./constants/paths"
import { readdir, access, constants } from "fs/promises"
import { zTokenDataJson } from "./types/TokenDataJson"
import { glob } from "glob"

export const validate = async (): Promise<void> => {
  try {
    // Read tokens then asyncronously validate all of them
    const tokens = await readdir(DATA_DIR)
    await Promise.allSettled(
      tokens.flatMap(token => {
        return [validateTokenJson(token), validateLogo(token)]
      })
    ).then(results => {
      return results.filter(result => result.status === 'rejected')
    })
  } catch (e) {
    console.error(e)
    console.error('Unexpected error validating tokens')
    process.exit(1)
  }
}

const validateTokenJson = async (token: string) => {
  const datafile = join(DATA_DIR, token, 'data.json')
  const dataFileExists = await access(datafile, constants.F_OK).then(() => true).catch(() => false)
  if (!dataFileExists) {
    throw new Error(`Token ${token} is missing data.json at ${datafile}. Please name your data file data.json and place it in the token's directory.`)
  }
  const validatedTokenJson = zTokenDataJson.safeParse(await import(datafile))
  if (validatedTokenJson.success === false) {
    throw new Error(`Token ${token} has invalid data.json: ${JSON.stringify(validatedTokenJson.error.format())}`)
  }
}
const validateLogo = async (token: string) => {
  const logofiles = await glob(`${join(DATA_DIR, token)}/logo.{png,svg}`)
  if (logofiles.length !== 1) {
    throw new Error(`${token} has ${logofiles.length} logo files, make sure your logo is either logo.png OR logo.svg`)
  }
}
