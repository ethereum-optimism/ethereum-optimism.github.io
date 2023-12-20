import { globSync } from "glob"
import { join } from "path"

/**
 * Validates an id has a valid logo and returns the path to that logo
 */
export const validateLogo = async (id: string): Promise<string> => {
  const logofiles = globSync(`${join(__dirname, '..', 'data', id)}/logo.{png,svg}`)
  if (logofiles.length !== 1) {
    throw new Error(`${id} has ${logofiles.length} logo files. It should have 1. Make sure your logo is either logo.png OR logo.svg`)
  }
  return logofiles[0]
}

