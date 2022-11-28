import _extendedList from '../optimism.tokenlist.json'
import _defaultSymbols from '../optimism.defaulttokens.json'

export interface TokenList {
    name: string
    logoURI: string
    tokens: TokenListItem[]
}

export interface TokenListItem {
    chainId: number
    address: string
    name: string
    symbol: string
    decimals: number
    logoURI?: string
    extensions?: {
        optimismBridgeAddress?: string
        ens?: string
    }
}

export enum TokenListChoice {
    'EXTENDED' = 'EXTENDED',
    'DEFAULT' = 'DEFAULT',
    'DEFAULT_DEVNET' = 'DEFAULT_DEVNET',
    'EXTENDED_DEVNET' = 'EXTENDED_DEVNET',
}

export const extendedList = _extendedList

export interface FilterOptions {
    chainId?: number
    filterTerm?: string
}

export const filterTokens = (
    list: TokenList['tokens'],
    { chainId, filterTerm }: FilterOptions = {}
) => {
    return (
        list
            // filter by chainId
            .filter((token) => !chainId || token.chainId === chainId)
            // filter by filterTerm
            .filter(
                (token) =>
                    !filterTerm ||
                    token.address.toLowerCase().includes(filterTerm.toLowerCase()) ||
                    token.symbol.toLowerCase().includes(filterTerm.toLowerCase()) ||
                    token.name.toLowerCase().includes(filterTerm.toLowerCase())
            )
    )
}

const defaultSymbols = new Set(_defaultSymbols)

export const defaultTokenList = {
    ...extendedList,
    name: 'Default Token List',
    tokens: extendedList.tokens.filter(({ symbol }) =>
        defaultSymbols.has(symbol)
    ),
}

export const tokensByNetwork = {
    1: filterTokens(extendedList.tokens, { chainId: 1 }),
    5: filterTokens(extendedList.tokens, { chainId: 5 }),
    10: filterTokens(extendedList.tokens, { chainId: 10 }),
    420: filterTokens(extendedList.tokens, { chainId: 420 }),
}
