import { join } from 'path'
import { TokenDataJson, zTokenDataJson } from './types/TokenDataJson'

/**
 * Loads and validates a token from it's data.json file
 */
export const validateDataJson = async (id: string): Promise<TokenDataJson> => {
  const path = join(__dirname, '..', '..', 'data', id, 'data.json')
  const data = await import(path)
  const parsedDataJson = zTokenDataJson.safeParse(data)
  if (parsedDataJson.success === false) {
    throw new Error(JSON.stringify(parsedDataJson.error.format()))
  }
  return parsedDataJson.data
}
