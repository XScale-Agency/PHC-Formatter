import type { PhcNode } from './src/types.js'

const idRegex = /^[a-z\d-]{1,32}$/
const nameRegex = /^[a-z\d-]{1,32}$/
const decimalRegex = /^((-)?[1-9]\d*|0)$/
const versionRegex = /^v=(\d+)$/

/**
 * Serializes the options object into a formatted PHC string.
 * @param options - The options object.
 * @returns The serialized string.
 * @throws {TypeError} If any of the input values are invalid.
 */
export const serialize = (options: {
  id: string
  hash: Uint8Array
  salt: Uint8Array
  version?: number
  parameters?: Record<string, number>
}) => {
  if (!idRegex.test(options.id)) {
    throw new TypeError(`id must be a string of 1-32 characters`)
  }

  if (!Buffer.isBuffer(options.hash)) {
    throw new TypeError(`hash must be a buffer`)
  }

  if (!Buffer.isBuffer(options.salt)) {
    throw new TypeError(`salt must be a buffer`)
  }

  if (options.version && !versionRegex.test(`v=${options.version}`)) {
    throw new TypeError(`version must be a number`)
  }

  if (options.parameters) {
    for (const [key, value] of Object.entries(options.parameters)) {
      if (!nameRegex.test(key)) {
        throw new TypeError(`parameters key must be a string of 1-32 characters`)
      }

      if (typeof value === 'number' && !decimalRegex.test(value.toString())) {
        throw new TypeError(`parameters value must be a number`)
      }

      if (key === 'v') {
        throw new TypeError(`parameters key cannot be 'v'`)
      }
    }
  }

  const version = options.version ? `$v=${options.version}` : ''

  const parameters = options.parameters
    ? `$${Object.entries(options.parameters)
        .map(([key, value]) => `${key}=${value}`)
        .join(',')}`
    : ''

  return `$${options.id}${version}${parameters}$${options.hash
    .toString('base64')
    .replace(/=+$/, '')}$${options.salt.toString('base64').replace(/=+$/, '')}`
}

/**
 * Deserializes a PHC string into an object.
 * @param phc - The PHC string.
 * @returns The deserialized object.
 * @throws {TypeError} If the input string is invalid.
 *
 * Take in consider that the version, parameters are optional
 */
export const deserialize = (phc: string): PhcNode => {
  if (!phc.startsWith('$')) {
    throw new TypeError(`phc must start with a $`)
  }

  const parts = phc.split('$').slice(1)

  if (parts.length < 3) {
    throw new TypeError(`phc must have at least 3 parts`)
  }

  const id = parts.shift()

  if (id && !idRegex.test(id)) {
    throw new TypeError(`id must be a string of 1-32 characters`)
  } else if (!id) {
    throw new TypeError(`id is required`)
  }

  const salt = Buffer.from(parts.pop() ?? '', 'base64')

  if (!Buffer.isBuffer(salt)) {
    throw new TypeError(`salt must be a buffer`)
  }

  const hash = Buffer.from(parts.pop() ?? '', 'base64')

  if (!Buffer.isBuffer(hash)) {
    throw new TypeError(`hash must be a buffer`)
  }

  if (parts.length === 0) {
    return { id, hash, salt }
  }

  const _parseParameters = (parameters: string) => {
    const result: Record<string, number> = {}

    for (const part of parameters.split(',')) {
      const [key, value] = part.split('=')

      if (!nameRegex.test(key)) {
        throw new TypeError(`parameters key must be a string of 1-32 characters`)
      }

      if (!decimalRegex.test(value)) {
        throw new TypeError(`parameters value must be a number`)
      }

      result[key] = Number.parseInt(value, 10)
    }

    return result
  }

  const _parsePart = (part: string | undefined) => {
    if (part) {
      if (versionRegex.test(part)) {
        version = Number.parseInt(part.slice(2), 10)
      } else {
        parameters = _parseParameters(part)
      }
    }
  }

  let version: number | undefined
  let parameters: Record<string, number> | undefined

  _parsePart(parts.shift())

  if (parts.length === 0) {
    return { id, hash, salt, version, parameters }
  }

  _parsePart(parts.shift())

  return { id, hash, salt, version, parameters }
}
