import { providers } from 'ethers'

export interface Token {
  address: string
  overrides?: {
    bridge?: string
    name?: string
    symbol?: string
    decimals?: number
  }
}

export type Chain =
  | 'ethereum'
  | 'optimism'
  | 'goerli'
  | 'optimism-goerli'
  | 'base-goerli'

export interface TokenData {
  nonstandard?: boolean
  nobridge?: boolean
  twitter?: string
  name: string
  symbol: string
  decimals: number
  description: string
  website: string
  tokens: Partial<Record<Chain, Token>>
}

export interface ExpectedMismatches {
  [folder: string]: Partial<Record<Chain, { symbol?: string; name?: string }>>
}

export interface ValidationResult {
  type: 'error' | 'warning'
  message: string
}

export interface Network {
  id: number
  name: string
  provider: providers.BaseProvider
  layer: number
  bridge: string
}
