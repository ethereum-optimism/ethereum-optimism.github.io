import { NETWORK_DATA } from './chains'

export const ADDRESS_TYPE = {
  type: 'string',
  minLength: 42,
  maxLength: 42,
}

export const TOKEN_SCHEMA = {
  type: 'object',
  properties: {
    address: ADDRESS_TYPE,
    overrides: {
      bridge: ADDRESS_TYPE,
      name: {
        type: 'string',
      },
      symbol: {
        type: 'string',
        pattern: '^\\S+$', // allow unicode
      },
      decimals: {
        type: 'integer',
      },
    },
  },
  additionalProperties: false,
  required: ['address'],
}

export const TOKEN_DATA_SCHEMA = {
  type: 'object',
  properties: {
    nonstandard: {
      type: 'boolean',
    },
    nobridge: {
      type: 'boolean',
    },
    name: {
      type: 'string',
    },
    symbol: {
      type: 'string',
    },
    decimals: {
      type: 'integer',
    },
    description: {
      type: 'string',
      minLength: 1,
      maxLength: 1000,
    },
    website: {
      type: 'string',
      format: 'uri',
    },
    twitter: {
      type: 'string',
    },
    tokens: {
      type: 'object',
      properties: {
        ...Object.keys(NETWORK_DATA).reduce(
          (acc, chain) => ({
            ...acc,
            [chain]: TOKEN_SCHEMA,
          }),
          {}
        ),
      },
      additionalProperties: false,
      anyOf: [
        { required: ['ethereum'] },
        { required: ['optimism'] },
        { required: ['base'] },
        { required: ['mode'] },
        { required: ['lisk'] },
        { required: ['unichain'] },
        { required: ['redstone'] },
        { required: ['metall2'] },
        { required: ['soneium'] },
        { required: ['celo'] },
        { required: ['swellchain'] },
        { required: ['ink'] },
        { required: ['worldchain'] },
        { required: ['sepolia'] },
        { required: ['base-sepolia'] },
        { required: ['optimism-sepolia'] },
        { required: ['lisk-sepolia'] },
        { required: ['metall2-sepolia'] },
        { required: ['unichain-sepolia'] },
        { required: ['soneium-minato'] },
        { required: ['celo-sepolia'] },
        { required: ['ink-sepolia'] },
        { required: ['worldchain-sepolia'] },
      ],
    },
  },
  additionalProperties: false,
  required: ['name', 'symbol', 'decimals', 'tokens'],
}

export default {
  TOKEN_DATA_SCHEMA,
}
