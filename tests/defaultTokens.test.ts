import { filterTokens, defaultTokenList, defaultSymbols } from '../src'

describe('default tokens', () => {
  it('all default tokens symbols should exist on the default token list without a typo', () => {
    expect(defaultSymbols.size).toBeGreaterThan(0)
    defaultSymbols.forEach((symbol) => {
      expect(
        filterTokens(defaultTokenList.tokens, { filterTerm: symbol }).length
      ).toBeGreaterThan(0)
    })
  })
})
