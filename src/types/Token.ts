import { z } from 'zod'
import { zAddress } from './Address'

/**
 * Validator for valid token metadata
 */
export const zToken = z.strictObject({
  address: zAddress.describe('Token address'),
  overrides: z.strictObject({
    bridge: zAddress.describe('Address of the optimism bridge for current chain'),
    name: z.string().describe('Token name'),
    symbol: z.string().describe('Token symbol'),
    decimals: z.number().int().min(0).max(18).describe('Token decimals'),
  }).optional().describe('Optional per chain overrides for token metadata'),
}).describe('Token address and metadata')

/**
 * Valid token metadata
 */
export type Token = z.infer<typeof zToken>

