import fs from 'fs'
import path from 'path'

describe('circulatingSupply.txt', () => {
  const filePath = path.resolve(__dirname, '../tokenomics/circulatingSupply.txt')

  test('should contain a single line with a non-negative number', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter((line) => line.length > 0)

    expect(lines.length).toBe(1)

    const value = Number(lines[0])
    expect(Number.isNaN(value)).toBe(false)
    expect(value).toBeGreaterThanOrEqual(0)
  })
})
