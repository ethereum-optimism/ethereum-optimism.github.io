import path from 'path'

import { generate } from '../src/generate'

test("'generate' script parse data dir and compile correct token list", async () => {
  jest
    .spyOn(path, 'resolve')
    .mockReturnValueOnce(path.resolve(__dirname, 'data'))

  const mockDate = new Date(1660755600000)
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

  const tokenList = generate(path.resolve(__dirname, 'data'))
  expect(tokenList).toMatchSnapshot({
    timestamp: mockDate.toISOString(),
  })
})
