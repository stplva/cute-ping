import { describe, expect, it } from 'vitest'

import { getOrCreateProfile, getSessionId, sanitizeNickname } from './identity'

describe('getOrCreateProfile', () => {
  it('returns a stable id and avatar across calls', () => {
    const a = getOrCreateProfile()
    const b = getOrCreateProfile()
    expect(a.id).toBe(b.id)
    expect(a.avatar).toBe(b.avatar)
  })

  it('returns a non-empty avatar', () => {
    const profile = getOrCreateProfile()
    expect(profile.avatar.length).toBeGreaterThan(0)
  })
})

describe('getSessionId', () => {
  it('returns a stable session id across calls', () => {
    expect(getSessionId()).toBe(getSessionId())
  })
})

describe('sanitizeNickname', () => {
  it('clamps to the max length', () => {
    const long = 'a'.repeat(100)
    expect(sanitizeNickname(long).length).toBeLessThanOrEqual(24)
  })

  it('strips control characters', () => {
    expect(sanitizeNickname('abc\u0000def')).toBe('abcdef')
    expect(sanitizeNickname('hello\u200Bworld')).toBe('helloworld')
  })

  it('trims surrounding whitespace', () => {
    expect(sanitizeNickname('  sofi  ')).toBe('sofi')
  })
})
