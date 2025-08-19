import { ethers } from 'ethers'

interface ProviderConfig {
    timeout?: number
    retries?: number
    throttleLimit?: number
}

const DEFAULT_CONFIG: ProviderConfig = {
    timeout: 30000, // 30 seconds
    retries: 3,
    throttleLimit: 1
}

/**
 * Creates a robust provider with timeout, retry, and fallback capabilities
 */
export const createRobustProvider = (
    urls: string | string[],
    networkish?: ethers.providers.Networkish,
    config: ProviderConfig = {}
): ethers.providers.BaseProvider => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config }
    const urlArray = Array.isArray(urls) ? urls : [urls]

    // Single provider with timeout
    if (urlArray.length === 1) {
        return new ethers.providers.StaticJsonRpcProvider({
            url: urlArray[0],
            timeout: finalConfig.timeout,
            throttleLimit: finalConfig.throttleLimit
        }, networkish)
    }

    // Multiple providers with fallback
    const providers = urlArray.map(url =>
        new ethers.providers.StaticJsonRpcProvider({
            url,
            timeout: finalConfig.timeout,
            throttleLimit: finalConfig.throttleLimit
        }, networkish)
    )

    return new ethers.providers.FallbackProvider(providers, 1)
}

/**
 * Get RPC URLs with environment variable overrides and fallbacks
 */
export const getRpcUrls = (chain: string): string[] => {
    const envKey = `${chain.toUpperCase().replace('-', '_')}_RPC_URL`
    const envUrl = process.env[envKey]

    if (envUrl) {
        return [envUrl, ...getDefaultRpcUrls(chain)]
    }

    return getDefaultRpcUrls(chain)
}

/**
 * Get Infura project ID from environment variable
 */
const getInfuraProjectId = (): string => {
    return process.env.INFURA_PROJECT_ID || '84842078b09946638c03157f83405213' // fallback to existing default
}

/**
 * Default RPC URLs with Infura endpoints and fallbacks
 */
const getDefaultRpcUrls = (chain: string): string[] => {
    const infuraProjectId = getInfuraProjectId()

    const rpcMap: Record<string, string[]> = {
        ethereum: [
            `https://mainnet.infura.io/v3/${infuraProjectId}`,
            'https://eth.llamarpc.com',
            'https://rpc.ankr.com/eth'
        ],
        sepolia: [
            `https://sepolia.infura.io/v3/${infuraProjectId}`,
            'https://rpc.sepolia.org',
            'https://ethereum-sepolia.publicnode.com'
        ],
        optimism: [
            `https://optimism-mainnet.infura.io/v3/${infuraProjectId}`,
            'https://mainnet.optimism.io',
            'https://optimism.llamarpc.com'
        ],
        'optimism-sepolia': [
            `https://optimism-sepolia.infura.io/v3/${infuraProjectId}`,
            'https://sepolia.optimism.io'
        ],
        base: [
            `https://base-mainnet.infura.io/v3/${infuraProjectId}`,
            'https://mainnet.base.org',
            'https://base.llamarpc.com'
        ],
        'base-sepolia': [
            `https://base-sepolia.infura.io/v3/${infuraProjectId}`,
            'https://sepolia.base.org'
        ],
        celo: [
            `https://celo-mainnet.infura.io/v3/${infuraProjectId}`,
            'https://forno.celo.org'
        ],
        // Chains not supported by Infura - use original endpoints
        unichain: [
            'https://mainnet.unichain.org'
        ],
        'unichain-sepolia': [
            'https://sepolia.unichain.org'
        ],
        mode: ['https://mainnet.mode.network'],
        lisk: ['https://rpc.api.lisk.com'],
        'lisk-sepolia': ['https://rpc.sepolia-api.lisk.com'],
        redstone: ['https://rpc.redstonechain.com'],
        metall2: ['https://rpc.metall2.com'],
        'metall2-sepolia': ['https://testnet.rpc.metall2.com'],
        soneium: ['https://rpc.soneium.org'],
        'soneium-minato': ['https://rpc.minato.soneium.org'],
        swellchain: ['https://swell-mainnet.alt.technology'],
        ink: ['https://rpc-gel.inkonchain.com'],
        'ink-sepolia': ['https://rpc-gel-sepolia.inkonchain.com'],
        worldchain: ['https://worldchain-mainnet.g.alchemy.com/public'],
        'worldchain-sepolia': ['https://worldchain-sepolia.g.alchemy.com/public'],
    }

    return rpcMap[chain] || []
}
