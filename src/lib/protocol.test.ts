import { describe, expect, it } from 'vitest'

import { createPingEvent, PING_EMOJIS, validatePingEvent } from './protocol'

describe('validatePingEvent', () => {
  it('accepts a valid ping', () => {
    const ping = createPingEvent('abc', PING_EMOJIS[0])
    expect(validatePingEvent(ping)).toBe(true)
  })

  it('rejects non-objects', () => {
    expect(validatePingEvent(null)).toBe(false)
    expect(validatePingEvent('ping')).toBe(false)
    expect(validatePingEvent(42)).toBe(false)
    expect(validatePingEvent(undefined)).toBe(false)
  })

  it('rejects wrong version', () => {
    const ping = createPingEvent('abc', PING_EMOJIS[0])
    expect(validatePingEvent({ ...ping, v: 2 })).toBe(false)
  })

  it('rejects wrong type', () => {
    const ping = createPingEvent('abc', PING_EMOJIS[0])
    expect(validatePingEvent({ ...ping, type: 'pong' })).toBe(false)
  })

  it('rejects an empty or non-string fromId', () => {
    const ping = createPingEvent('abc', PING_EMOJIS[0])
    expect(validatePingEvent({ ...ping, fromId: '' })).toBe(false)
    expect(validatePingEvent({ ...ping, fromId: 5 })).toBe(false)
  })

  it('rejects emojis outside the palette', () => {
    const ping = createPingEvent('abc', PING_EMOJIS[0])
    expect(validatePingEvent({ ...ping, emoji: '🐸' })).toBe(false)
    expect(validatePingEvent({ ...ping, emoji: '<img>' })).toBe(false)
  })

  it('rejects missing or non-finite timestamps', () => {
    const ping = createPingEvent('abc', PING_EMOJIS[0])
    expect(validatePingEvent({ ...ping, ts: undefined })).toBe(false)
    expect(validatePingEvent({ ...ping, ts: Number.NaN })).toBe(false)
  })
})
