export interface Profile {
  id: string
  avatar: string
}

const PROFILE_STORAGE_KEY = 'cute-ping.profile'

const AVATARS = ['🐱', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸']

const MAX_NICKNAME_LENGTH = 24

let memoryProfile: Profile | null = null
let sessionId: string | null = null

function randomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)]
}

function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null
  } catch {
    return null
  }
}

export function getOrCreateProfile(): Profile {
  const storage = getStorage()
  if (storage) {
    try {
      const raw = storage.getItem(PROFILE_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Profile>
        if (parsed && typeof parsed.id === 'string' && typeof parsed.avatar === 'string') {
          return { id: parsed.id, avatar: parsed.avatar }
        }
      }
    } catch {
      // fall through to creation below
    }
  }
  if (memoryProfile) return memoryProfile
  const profile: Profile = { id: crypto.randomUUID(), avatar: randomAvatar() }
  if (storage) {
    try {
      storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // ignore write failures
    }
  }
  memoryProfile = profile
  return profile
}

export function getSessionId(): string {
  if (!sessionId) sessionId = crypto.randomUUID()
  return sessionId
}

export function sanitizeNickname(raw: string): string {
  let out = ''
  for (const ch of raw) {
    const code = ch.charCodeAt(0)
    const isControl =
      (code >= 0x0000 && code <= 0x001f) ||
      (code >= 0x007f && code <= 0x009f) ||
      (code >= 0x200b && code <= 0x200f) ||
      code === 0x2028 ||
      code === 0x2029 ||
      code === 0xfeff
    if (!isControl) out += ch
  }
  return out.slice(0, MAX_NICKNAME_LENGTH).trim()
}
