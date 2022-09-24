import { ethers } from 'ethers'

export const NETWORK_DATA = {
  ethereum: {
    id: 1,
    name: 'Mainnet',
    provider: new ethers.providers.InfuraProvider('homestead'),
    layer: 1,
    pair: 'optimism',
    bridge: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://mainnet.optimism.io'
    ),
    layer: 2,
    pair: 'ethereum',
    bridge: '0x4200000000000000000000000000000000000010',
  },
  kovan: {
    id: 42,
    name: 'Kovan',
    provider: new ethers.providers.InfuraProvider('kovan'),
    layer: 1,
    pair: 'optimism-kovan',
    bridge: '0x22F24361D548e5FaAfb36d1437839f080363982B',
  },
  'optimism-kovan': {
    id: 69,
    name: 'Optimism Kovan',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://kovan.optimism.io'
    ),
    layer: 2,
    pair: 'kovan',
    bridge: '0x4200000000000000000000000000000000000010',
  },
  goerli: {
    id: 5,
    name: 'Goerli',
    provider: new ethers.providers.InfuraProvider('goerli'),
    layer: 1,
    pair: 'optimism-goerli',
    bridge: '0x636Af16bf2f682dD3109e60102b8E1A089FedAa8',
  },
  'optimism-goerli': {
    id: 420,
    name: 'Optimism Goerli',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://goerli.optimism.io'
    ),
    layer: 2,
    pair: 'goerli',
    bridge: '0x4200000000000000000000000000000000000010',
  },
}
