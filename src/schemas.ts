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
        ethereum: TOKEN_SCHEMA,
        optimism: TOKEN_SCHEMA,
        base: TOKEN_SCHEMA,
        'base-goerli': TOKEN_SCHEMA,
        'base-sepolia': TOKEN_SCHEMA,
        goerli: TOKEN_SCHEMA,
        sepolia: TOKEN_SCHEMA,
        'optimism-goerli': TOKEN_SCHEMA,
        'optimism-sepolia': TOKEN_SCHEMA,
        'zora': TOKEN_SCHEMA,
        'zora-sepolia': TOKEN_SCHEMA,
      },
      additionalProperties: false,
      anyOf: [
        { required: ['ethereum'] },
        { required: ['optimism'] },
        { required: ['base'] },
        { required: ['base-goerli'] },
        { required: ['base-sepolia'] },
        { required: ['goerli'] },
        { required: ['sepolia'] },
        { required: ['optimism-goerli'] },
        { required: ['optimism-sepolia'] },
        { required: ['zora'] },
        { required: ['zora-sepolia'] },
      ],
    },
  },
  additionalProperties: false,
  required: ['name', 'symbol', 'decimals', 'tokens'],
}

export default {
  TOKEN_DATA_SCHEMA,
}
