import { ethers } from 'ethers'

import { Chain, L1Chain, L2Chain, Network } from './types'

const DEFAULT_INFURA_KEY = '84842078b09946638c03157f83405213'

export const NETWORK_DATA: Record<Chain, Network> = {
  ethereum: {
    id: 1,
    name: 'Mainnet',
    provider: new ethers.providers.InfuraProvider('homestead'),
    layer: 1,
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://mainnet.optimism.io'
    ),
    layer: 2,
  },
  base: {
    id: 8453,
    name: 'Base',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://mainnet.base.org'
    ),
    layer: 2,
  },
  pgn: {
    id: 424,
    name: 'PGN - Public Goods Network',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://rpc.publicgoods.network'
    ),
    layer: 2,
  },
  mode: {
    id: 34443,
    name: 'Mode',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://mainnet.mode.network'
    ),
    layer: 2,
  },
  lisk: {
    id: 1135,
    name: 'Lisk',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://rpc.api.lisk.com'
    ),
    layer: 2,
  },
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    provider: new ethers.providers.StaticJsonRpcProvider(
      `https://sepolia.infura.io/v3/${DEFAULT_INFURA_KEY}`,
      11155111
    ),
    layer: 1,
  },
  'optimism-sepolia': {
    id: 11155420,
    name: 'Optimism Sepolia',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://sepolia.optimism.io'
    ),
    layer: 2,
  },
  'base-sepolia': {
    id: 84532,
    name: 'Base Sepolia',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://sepolia.base.org',
      84532
    ),
    layer: 2,
  },
  'pgn-sepolia': {
    id: 58008,
    name: 'PGN Sepolia',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://rpc.sepolia.publicgoods.network'
    ),
    layer: 2,
  },
  'lisk-sepolia': {
    id: 4202,
    name: 'Lisk Sepolia',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://rpc.sepolia-api.lisk.com'
    ),
    layer: 2,
  },
}

interface L2BridgeInformation {
  l2StandardBridgeAddress: string
}

interface L1BridgeInformation {
  l2Chain: L2Chain
  l1StandardBridgeAddress: string
}

export const L2_STANDARD_BRIDGE_INFORMATION: Record<
  L2Chain,
  L2BridgeInformation
> = {
  optimism: {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  base: {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  pgn: {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  mode: {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  lisk: {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  'optimism-sepolia': {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  'base-sepolia': {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  'pgn-sepolia': {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  'lisk-sepolia': {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
}

export const L2_TO_L1_PAIR: Partial<Record<L2Chain, L1Chain>> = {
  optimism: 'ethereum',
  base: 'ethereum',
  pgn: 'ethereum',
  mode: 'ethereum',
  lisk: 'ethereum',
  'optimism-sepolia': 'sepolia',
  'base-sepolia': 'sepolia',
  'pgn-sepolia': 'sepolia',
  'lisk-sepolia': 'sepolia',
}

export const L1_STANDARD_BRIDGE_INFORMATION: Record<
  L1Chain,
  L1BridgeInformation[]
> = {
  ethereum: [
    {
      l2Chain: 'optimism',
      l1StandardBridgeAddress: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
    },
    {
      l2Chain: 'base',
      l1StandardBridgeAddress: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
    },
    {
      l2Chain: 'pgn',
      l1StandardBridgeAddress: '0xD0204B9527C1bA7bD765Fa5CCD9355d38338272b',
    },
    {
      l2Chain: 'mode',
      l1StandardBridgeAddress: '0x735aDBbE72226BD52e818E7181953f42E3b0FF21',
    },
    {
      l2Chain: 'lisk',
      l1StandardBridgeAddress: '0x2658723Bf70c7667De6B25F99fcce13A16D25d08',
    },
  ],
  sepolia: [
    {
      l2Chain: 'optimism-sepolia',
      l1StandardBridgeAddress: '0xFBb0621E0B23b5478B630BD55a5f21f67730B0F1',
    },
    {
      l2Chain: 'pgn-sepolia',
      l1StandardBridgeAddress: '0xFaE6abCAF30D23e233AC7faF747F2fC3a5a6Bfa3',
    },
    {
      l2Chain: 'base-sepolia',
      l1StandardBridgeAddress: '0xfd0Bf71F60660E2f608ed56e1659C450eB113120',
    },
    {
      l2Chain: 'lisk-sepolia',
      l1StandardBridgeAddress: '0x1Fb30e446eA791cd1f011675E5F3f5311b70faF5',
    },
  ],
}
