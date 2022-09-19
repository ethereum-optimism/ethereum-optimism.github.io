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
      maxLength: 150,
    },
    website: {
      type: 'string',
      format: 'uri',
    },
    twitter: {
      type: 'string',
    },
    tokens: {
      oneOf: [
        {
          type: 'object',
          properties: {
            ethereum: TOKEN_SCHEMA,
            optimism: TOKEN_SCHEMA,
            kovan: TOKEN_SCHEMA,
            'optimism-kovan': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['ethereum', 'optimism', 'kovan', 'optimism-kovan'],
        },
        {
          type: 'object',
          properties: {
            ethereum: TOKEN_SCHEMA,
            optimism: TOKEN_SCHEMA,
            goerli: TOKEN_SCHEMA,
            'optimism-goerli': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['ethereum', 'optimism', 'goerli', 'optimism-goerli'],
        },
        {
          type: 'object',
          properties: {
            ethereum: TOKEN_SCHEMA,
            optimism: TOKEN_SCHEMA,
            kovan: TOKEN_SCHEMA,
            'optimism-kovan': TOKEN_SCHEMA,
            goerli: TOKEN_SCHEMA,
            'optimism-goerli': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: [
            'ethereum',
            'optimism',
            'kovan',
            'optimism-kovan',
            'goerli',
            'optimism-goerli',
          ],
        },
        {
          type: 'object',
          properties: {
            optimism: TOKEN_SCHEMA,
            'optimism-kovan': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['optimism', 'optimism-kovan'],
        },
        {
          type: 'object',
          properties: {
            optimism: TOKEN_SCHEMA,
            'optimism-goerli': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['optimism', 'optimism-goerli'],
        },
        {
          type: 'object',
          properties: {
            optimism: TOKEN_SCHEMA,
            'optimism-kovan': TOKEN_SCHEMA,
            'optimism-goerli': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['optimism', 'optimism-kovan', 'optimism-goerli'],
        },
        {
          type: 'object',
          properties: {
            ethereum: TOKEN_SCHEMA,
            optimism: TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['ethereum', 'optimism'],
        },
        {
          type: 'object',
          properties: {
            kovan: TOKEN_SCHEMA,
            'optimism-kovan': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['kovan', 'optimism-kovan'],
        },
        {
          type: 'object',
          properties: {
            goerli: TOKEN_SCHEMA,
            'optimism-goerli': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['goerli', 'optimism-goerli'],
        },
        {
          type: 'object',
          properties: {
            optimism: TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['optimism'],
        },
      ],
    },
  },
  additionalProperties: false,
  required: ['name', 'symbol', 'decimals', 'tokens', 'description', 'website'],
}

module.exports = {
  TOKEN_DATA_SCHEMA,
}
