ADDRESS_TYPE = {
  type: 'string',
  minLength: 42,
  maxLength: 42,
}

TOKEN_SCHEMA = {
  oneOf: [
    ADDRESS_TYPE,
    {
      type: 'object',
      properties: {
        address: ADDRESS_TYPE,
        bridge: ADDRESS_TYPE,
        name: {
          type: 'string',
        },
        symbol: {
          type: 'string',
        },
        decimals: {
          type: 'integer'
        }
      },
      additionalProperties: false,
      required: ['address']
    }
  ]
}

TOKEN_DATA_SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    symbol: {
      type: 'string',
    },
    decimals: {
      type: 'integer'
    },
    tokens: {
      oneOf: [
        {
          type: 'object',
          properties: {
            'ethereum': TOKEN_SCHEMA,
            'optimism': TOKEN_SCHEMA,
            'kovan': TOKEN_SCHEMA,
            'optimism-kovan': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['ethereum', 'optimism', 'kovan', 'optimism-kovan']
        },
        {
          type: 'object',
          properties: {
            'optimism': TOKEN_SCHEMA,
            'optimism-kovan': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['optimism', 'optimism-kovan']
        },
        {
          type: 'object',
          properties: {
            'ethereum': TOKEN_SCHEMA,
            'optimism': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['ethereum', 'optimism']
        },
        {
          type: 'object',
          properties: {
            'kovan': TOKEN_SCHEMA,
            'optimism-kovan': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['kovan', 'optimism-kovan']
        },
        {
          type: 'object',
          properties: {
            'optimism': TOKEN_SCHEMA,
          },
          additionalProperties: false,
          required: ['optimism']
        }
      ]
    },
    additionalProperties: false,
    required: ['name', 'symbol', 'decimals', 'tokens']
  }
}

module.exports = {
  TOKEN_DATA_SCHEMA
}
