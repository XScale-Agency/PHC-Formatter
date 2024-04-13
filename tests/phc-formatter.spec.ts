import { test } from '@japa/runner'
import * as PHCFormatter from '../index.js'

test.group('PHC Formatter', () => {
  const salt = 'iHSDPHzUhPzK7rCcJgOFfg'
  const hash =
    'J4moa2MM0/6uf3HbY2Tf5Fux8JIBTwIhmhxGRbsY14qhTltQt+Vw3b7tcJNEbk8ium8AQfZeD4tabCnNqfkD1g'

  const options = {
    id: 'argon2i',
    version: 19,
    parameters: {
      m: 120,
      t: 5000,
      p: 2,
    },
  }

  test('serialize', ({ assert }) => {
    const serialized = PHCFormatter.serialize({
      hash: Buffer.from(hash, 'base64'),
      salt: Buffer.from(salt, 'base64'),
      ...options,
    })

    assert.equal(serialized, `$argon2i$v=19$m=120,t=5000,p=2$${salt}$${hash}`)
  })

  test('deserialize', ({ assert }) => {
    const deserialized = PHCFormatter.deserialize(`$argon2i$v=19$m=120,t=5000,p=2$${salt}$${hash}`)

    assert.deepEqual(deserialized, {
      id: 'argon2i',
      hash: Buffer.from(hash, 'base64'),
      salt: Buffer.from(salt, 'base64'),
      version: 19,
      parameters: {
        m: 120,
        t: 5000,
        p: 2,
      },
    })
  })

  test('serialize with no version', ({ assert }) => {
    const serialized = PHCFormatter.serialize({
      hash: Buffer.from(hash, 'base64'),
      salt: Buffer.from(salt, 'base64'),
      id: 'argon2i',
      parameters: {
        m: 120,
        t: 5000,
        p: 2,
      },
    })

    assert.equal(serialized, `$argon2i$m=120,t=5000,p=2$${salt}$${hash}`)
  })

  test('deserialize with no version', ({ assert }) => {
    const deserialized = PHCFormatter.deserialize(`$argon2i$m=120,t=5000,p=2$${salt}$${hash}`)

    assert.deepEqual(deserialized, {
      id: 'argon2i',
      hash: Buffer.from(hash, 'base64'),
      salt: Buffer.from(salt, 'base64'),
      parameters: {
        m: 120,
        t: 5000,
        p: 2,
      },
      version: undefined,
    })
  })

  test('serialize with no parameters', ({ assert }) => {
    const serialized = PHCFormatter.serialize({
      hash: Buffer.from(hash, 'base64'),
      salt: Buffer.from(salt, 'base64'),
      id: 'argon2i',
      version: 19,
    })

    assert.equal(serialized, `$argon2i$v=19$${salt}$${hash}`)
  })

  test('deserialize with no parameters', ({ assert }) => {
    const deserialized = PHCFormatter.deserialize(`$argon2i$v=19$${salt}$${hash}`)

    assert.deepEqual(deserialized, {
      id: 'argon2i',
      hash: Buffer.from(hash, 'base64'),
      salt: Buffer.from(salt, 'base64'),
      version: 19,
      parameters: undefined,
    })
  })

  test('serialize with no parameters or version', ({ assert }) => {
    const serialized = PHCFormatter.serialize({
      hash: Buffer.from(hash, 'base64'),
      salt: Buffer.from(salt, 'base64'),
      id: 'argon2i',
    })

    assert.equal(serialized, `$argon2i$${salt}$${hash}`)
  })

  test('deserialize with no parameters or version', ({ assert }) => {
    const deserialized = PHCFormatter.deserialize(`$argon2i$${salt}$${hash}`)

    assert.deepEqual(deserialized, {
      id: 'argon2i',
      hash: Buffer.from(hash, 'base64'),
      salt: Buffer.from(salt, 'base64'),
    })
  })
})
