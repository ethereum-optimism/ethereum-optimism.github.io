export interface Token {
  address: string
  overrides?: {
    bridge?: string
    name?: string
    symbol?: string
    decimals?: number
  }
}

export interface TokenData {
  nonstandard?: boolean
  nobridge?: boolean
  twitter?: string
  name: string
  symbol: string
  decimals: number
  description: string
  website: string
  tokens: {
    ethereum?: Token
    optimism?: Token
    kovan?: Token
    'optimism-kovan'?: Token
    goerli?: Token
    'optimism-goerli'?: Token
  }
}

export interface ValidationResult {
  type: 'error' | 'warning'
  message: string
}
