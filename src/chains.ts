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
  'redstone': {
    id: 690,
    name: 'Redstone',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://rpc.redstonechain.com'
    ),
    layer: 2
  },
  'metall2': {
    id: 1750,
    name: 'Metal L2',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://rpc.metall2.com'
    ),
    layer: 2
  },
  'bob': {
    id: 60808,
    name: 'BOB',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://rpc.gobob.xyz'
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
  'metall2-sepolia': {
    id: 1740,
    name: 'Metal L2 Sepolia',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://testnet.rpc.metall2.com'
    ),
    layer: 2,
  },
  'bob-sepolia': {
    id: 808813,
    name: 'BOB Sepolia',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://bob-sepolia.rpc.gobob.xyz'
    ),
    layer: 2,
  },
  'unichain': {
    id: 130,
    name: 'Unichain',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://mainnet.unichain.org'
    ),
    layer: 2,
  },
  'celo': {
    id: 42220,
    name: 'Celo',
    provider: new ethers.providers.StaticJsonRpcProvider(
      'https://celo.drpc.org'
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
  'redstone': {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010'
  },
  'metall2': {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  'bob': {
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
  'metall2-sepolia': {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  'bob-sepolia': {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  unichain: {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  },
  celo: {
    l2StandardBridgeAddress: '0x4200000000000000000000000000000000000010',
  }
}

export const L2_TO_L1_PAIR: Partial<Record<L2Chain, L1Chain>> = {
  optimism: 'ethereum',
  base: 'ethereum',
  pgn: 'ethereum',
  mode: 'ethereum',
  lisk: 'ethereum',
  redstone: 'ethereum',
  metall2: 'ethereum',
  bob: 'ethereum',
  'optimism-sepolia': 'sepolia',
  'base-sepolia': 'sepolia',
  'pgn-sepolia': 'sepolia',
  'lisk-sepolia': 'sepolia',
  'metall2-sepolia': 'sepolia',
  'bob-sepolia': 'sepolia',
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
    {
      l2Chain: 'redstone',
      l1StandardBridgeAddress: '0xc473ca7E02af24c129c2eEf51F2aDf0411c1Df69',
    },
    {
      l2Chain: 'metall2',
      l1StandardBridgeAddress: '0x6d0f65D59b55B0FEC5d2d15365154DcADC140BF3',
    },
    {
      l2Chain: 'bob',
      l1StandardBridgeAddress: '0x3F6cE1b36e5120BBc59D0cFe8A5aC8b6464ac1f7',
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
    {
      l2Chain: 'metall2-sepolia',
      l1StandardBridgeAddress: '0x21530aAdF4DCFb9c477171400E40d4ef615868BE',
    },
    {
      l2Chain: 'bob-sepolia',
      l1StandardBridgeAddress: '0x75f48FE4DeAB3F9043EE995c3C84D6a2303D9a2F',
    },
  ]
}
