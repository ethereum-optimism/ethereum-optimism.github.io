import { z } from 'zod'
import * as viemChains from 'viem/chains'

/**
 * Validator for valid l1 network names
 */
export const zL1NetworkName = z.union([
  z.literal('ethereum'),
  z.literal('goerli'),
  z.literal('sepolia'),
]).describe('Valid L1 network name')

/**
 * Valid L1 network name
 */
export type L1NetworkName = z.infer<typeof zL1NetworkName>

/**
 * Validator for valid l2 network names
 */
export const zL2NetworkName = z.union([
  z.literal('optimism'),
  z.literal('base'),
  z.literal('base-goerli'),
  z.literal('optimism-goerli'),
]).describe('Valid L2 network name')

/**
 * Valid L2 network name
 */
export type L2NetworkName = z.infer<typeof zL2NetworkName>

/**
 * Validator for valid network names
 */
export const zNetworkName = z.union([
  zL1NetworkName,
  zL2NetworkName,
]).describe('Valid network name')

/**
 * Valid network name
 */
export type NetworkName = z.infer<typeof zNetworkName>

export const networks = {
  ethereum: {
    ...viemChains.mainnet,
  }
}
