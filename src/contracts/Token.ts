import { createTevmContract } from '@tevm/core'

export const tokenContract = createTevmContract({
  name: 'Token',
  humanReadableAbi: [
    'function name() view returns (string)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
  ],
  bytecode: undefined,
  deployedBytecode: undefined
})
