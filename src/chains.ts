import { ethers } from 'ethers'

import { Chain, Network } from './types'

export const NETWORK_DATA: Record<Chain, Network> = {
  ethereum: {
    id: 1,
    name: 'Mainnet',
    provider: new ethers.providers.InfuraProvider('homestead'),
    layer: 1,
    bridge: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://mainnet.optimism.io'
    ),
    layer: 2,
    bridge: '0x4200000000000000000000000000000000000010',
  },
  goerli: {
    id: 5,
    name: 'Goerli',
    provider: new ethers.providers.InfuraProvider('goerli'),
    layer: 1,
    bridge: '0x636Af16bf2f682dD3109e60102b8E1A089FedAa8',
  },
  'optimism-goerli': {
    id: 420,
    name: 'Optimism Goerli',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://goerli.optimism.io'
    ),
    layer: 2,
    bridge: '0x4200000000000000000000000000000000000010',
  },
  'base-goerli': {
    id: 84531,
    name: 'Base Goerli',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://goerli.base.org',
      84531
    ),
    layer: 2,
    bridge: '0x4200000000000000000000000000000000000010',
  },
}

export const L2_TO_L1_PAIR: Partial<Record<Chain, Chain>> = {
  optimism: 'ethereum',
  'optimism-goerli': 'goerli',
  'base-goerli': 'goerli',
}
