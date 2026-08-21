import { describe, expect, it } from 'vitest'

import { CODE_LENGTH, formatCode, generateCode, isValidCode, normalizeCode } from './code'

describe('generateCode', () => {
  it('returns CODE_LENGTH characters that are all valid', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateCode()
      expect(code).toHaveLength(CODE_LENGTH)
      expect(isValidCode(code)).toBe(true)
    }
  })
})

describe('normalizeCode', () => {
  it('uppercases and strips separators', () => {
    expect(normalizeCode('abcd ef-gh')).toBe('ABCDEFGH')
  })

  it('maps common look-alikes', () => {
    expect(normalizeCode('0O1I8B')).toBe('OOIIBB')
  })

  it('clamps to CODE_LENGTH', () => {
    expect(normalizeCode('ABCDEFGHIJKLMN')).toHaveLength(CODE_LENGTH)
  })
})

describe('isValidCode', () => {
  it('accepts valid codes', () => {
    expect(isValidCode('ABCDEFGH')).toBe(true)
  })

  it('rejects invalid codes', () => {
    expect(isValidCode('ABCDEFG')).toBe(false)
    expect(isValidCode('ABCDEFG0')).toBe(false)
    expect(isValidCode('abcdefgh')).toBe(false)
  })
})

describe('formatCode', () => {
  it('groups into two 4-char chunks', () => {
    expect(formatCode('ABCDEFGH')).toBe('ABCD EFGH')
  })
})
