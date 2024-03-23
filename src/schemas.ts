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
        mode: TOKEN_SCHEMA,
        pgn: TOKEN_SCHEMA,
        sepolia: TOKEN_SCHEMA,
        'base-sepolia': TOKEN_SCHEMA,
        'optimism-sepolia': TOKEN_SCHEMA,
        'pgn': TOKEN_SCHEMA,
        'pgn-sepolia': TOKEN_SCHEMA,
      },
      additionalProperties: false,
      anyOf: [
        { required: ['ethereum'] },
        { required: ['optimism'] },
        { required: ['base'] },
        { required: ['mode'] },
        { required: ['pgn'] },
        { required: ['sepolia'] },
        { required: ['base-sepolia'] },
        { required: ['optimism-sepolia'] },
        { required: ['pgn'] },
        { required: ['pgn-sepolia'] },
      ],
    },
  },
  additionalProperties: false,
  required: ['name', 'symbol', 'decimals', 'tokens'],
}

export default {
  TOKEN_DATA_SCHEMA,
}
