export * from './solc'
export * from './unplugin'
export * from './types'
export * from './bundler'
export * from './runtime'
export * from './createCache'
import { z } from 'zod'
import { isAddress } from 'viem'
import { existsSync } from 'fs'
import { join } from 'path'

export const zAddress = z.string().refine(isAddress).describe('Valid Ethereum address')

export const zWebsite = z.string().url().describe('Valid website URL')

export const zL1NetworkName = z.union([
  z.literal('ethereum'),
  z.literal('goerli'),
  z.literal('sepolia'),
]).describe('Valid L1 network name')

export const zL2NetworkName = z.union([
  z.literal('optimism'),
  z.literal('base'),
  z.literal('base-goerli'),
  z.literal('optimism-goerli'),
]).describe('Valid L2 network name')

export const zNetworkName = z.union([
  zL1NetworkName,
  zL2NetworkName,
]).describe('Valid network name')

export const zToken = z.strictObject({
  address: zAddress.describe('Token address'),
  overrides: z.strictObject({
    bridge: zAddress.describe('Address of the optimism bridge for current chain'),
    name: z.string().describe('Token name'),
    symbol: z.string().describe('Token symbol'),
    decimals: z.number().int().min(0).max(18).describe('Token decimals'),
  }).optional().describe('Optional per chain overrides for token metadata'),
}).describe('Token address and metadata')

export const zTokenDataJson = z.strictObject({
  /**
   * Token props
   */
  name: z.string().describe('Token name'),
  symbol: z.string().describe('Token symbol'),
  decimals: z.number().int().min(0).max(18).describe('Token decimals'),
  /**
   * Bridge props
   */
  nonstandard: z.boolean().optional().describe('Whether the token is non-standard'),
  nobridge: z.boolean().optional().describe('Whether the token is not bridged'),
  /**
   * Project info
   */
  description: z.string().min(1).max(1000).optional().describe('Token description'),
  website: zWebsite.optional().describe('Project website for token'),
  twitter: zWebsite.optional().describe('Project website for token'),
  tokens: z.record(zNetworkName)
})

const zExpectedMismatches = z.strictObject({
  todo: z.boolean()
})

const zLogoPaths = z.array(z.string()).min(1).refine(async paths => {
  return paths.every(path => existsSync(path))
}).describe('Valid logos')

export class TokenEntry {
  public static readonly fromTokenSymbol = async (symbol: string): TokenEntry => {
    const tokenDir = join(__dirname, '..', 'data', symbol)
    return new TokenEntry(
      await import(join(tokenDir, 'data.json')),
    )
  }

  constructor(
    public readonly dataJson: Readonly<z.infer<typeof zTokenDataJson>>,
    public readonly logoPaths: Readonly<z.infer<typeof zLogoPaths>>,
    public readonly expectedMismatches?: Readonly<z.infer<typeof zExpectedMismatches>>,
  ) { }

  public readonly isValid = async (): Promise<boolean> => {
    const results = await Promise.allSettled([
      zTokenDataJson.parse(this.dataJson),
      zExpectedMismatches.optional().parse(this.expectedMismatches),
      zLogoPaths.parse(this.logoPaths),
    ])
    return results.every(result => result.status === 'fulfilled')
  }
}
