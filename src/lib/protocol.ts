export const PING_EVENT_VERSION = 1 as const
export const PING_EVENT_TYPE = 'ping' as const

export interface PingEvent {
  v: 1
  type: 'ping'
  fromId: string
  emoji: string
  ts: number
}

export const PING_EMOJIS = ['🐱', '💖', '⭐', '🐶', '🎀'] as const
export type PingEmoji = (typeof PING_EMOJIS)[number]

export function isPingEmoji(value: unknown): value is PingEmoji {
  return typeof value === 'string' && (PING_EMOJIS as readonly string[]).includes(value)
}

export function createPingEvent(fromId: string, emoji: PingEmoji): PingEvent {
  return { v: 1, type: 'ping', fromId, emoji, ts: Date.now() }
}

export function validatePingEvent(raw: unknown): raw is PingEvent {
  if (typeof raw !== 'object' || raw === null) return false
  const r = raw as Record<string, unknown>
  return (
    r.v === PING_EVENT_VERSION &&
    r.type === PING_EVENT_TYPE &&
    typeof r.fromId === 'string' &&
    r.fromId.length > 0 &&
    isPingEmoji(r.emoji) &&
    typeof r.ts === 'number' &&
    Number.isFinite(r.ts)
  )
}
