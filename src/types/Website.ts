import { z } from 'zod'

/**
 * Validator for valid website URLs
 */
export const zWebsite = z.string().url().describe('Valid website URL')

/**
 * Valid website URL
 */
export type Website = z.infer<typeof zWebsite>
