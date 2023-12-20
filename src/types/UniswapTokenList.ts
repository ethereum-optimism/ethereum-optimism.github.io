import { z } from 'zod'
import { fetchJson } from '../utils/fetchJson';

/*
 * Uniswap standard for tokenlist
 * Note: this is a subset of our Token type
 */
export const zUniswapToken = z.object({
  chainId: z.number(),
  address: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  logoURI: z.string().url(),
});

/**
 * The type of the uniswap tokenlist as returned by
 * https://tokens.coingecko.com/uniswap/all.json
 */
export const zUniswapTokenList = z.object({
  name: z.string(),
  logoURI: z.string().url(),
  keywords: z.array(z.string()),
  timestamp: z.string(),
  tokens: z.array(zUniswapToken),
});

export type UniswapTokenList = z.infer<typeof zUniswapTokenList>

export const COIN_GECKO_TOKENLIST = 'https://tokens.coingecko.com/uniswap/all.json';

/**
 * Fetches and caches the tokenlist
 */
export const fetchTokenlist = async (url: string = COIN_GECKO_TOKENLIST): Promise<z.infer<typeof zUniswapTokenList>> => {
  return zUniswapTokenList.parse(await fetchJson(url));
}

