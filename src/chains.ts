import { createPublicClient, http } from 'viem'
import * as foo from 'viem/op_stack'

console.log(foo)
createPublicClient({
  chain: optimism as any as typeof import('viem/chains').optimism,
  transport: http(optimism.rpcUrls.default.http[0])
})
createPublicClient({
  // this import doesn't work
  chain: optimism as typeof import('viem/chains/opStack/chains').optimism,
  transport: http(optimism.rpcUrls.default.http[0])
})
