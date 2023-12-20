import { existsSync } from 'fs'
import { z } from 'zod'

/**
 * Validator for valid logo paths
 */
export const zLogoPaths = z.array(z.string()).min(1).refine(async paths => {
  return paths.every(path => existsSync(path))
}).describe('Valid logos')

/**
 * Valid logo paths
 */
export type LogoPaths = z.infer<typeof zLogoPaths>
