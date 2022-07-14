const { ethers } = require('ethers')

const CHAIN_IDS = {
  MAINNET_L1: 1,
  MAINNET_L2: 10,
  KOVAN_L1: 42,
  KOVAN_L2: 69
};

const NETWORK_DATA = {
  [CHAIN_IDS.MAINNET_L1]: {
    name: 'Mainnet',
    provider: new ethers.providers.InfuraProvider('homestead'),
    layer: 1,
    pair: CHAIN_IDS.MAINNET_L2,
  },
  [CHAIN_IDS.MAINNET_L2]: {
    name: 'Optimism',
    provider: new ethers.providers.JsonRpcProvider('https://mainnet.optimism.io'),
    layer: 2,
    pair: CHAIN_IDS.MAINNET_L1,
  },
  [CHAIN_IDS.KOVAN_L1]: {
    name: 'Kovan',
    provider: new ethers.providers.InfuraProvider('kovan'),
    layer: 1,
    pair: CHAIN_IDS.KOVAN_L2,
  },
  [CHAIN_IDS.KOVAN_L2]: {
    name: 'Optimism Kovan',
    provider: new ethers.providers.JsonRpcProvider('https://kovan.optimism.io'),
    layer: 2,
    pair: CHAIN_IDS.KOVAN_L1,
  },
}

module.exports = {
  CHAIN_IDS,
  NETWORK_DATA,
}
