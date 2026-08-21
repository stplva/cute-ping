import type { RealtimeChannel } from '@supabase/supabase-js'

import { sanitizeNickname } from './identity'
import { validatePingEvent, type PingEvent } from './protocol'
import { supabase } from './supabase'

export const PING_BROADCAST_EVENT = 'ping'

export type RealtimeStatus = 'connecting' | 'connected' | 'reconnecting'

export interface PresenceMeta {
  id: string
  nickname: string
  avatar: string
}

export type PresenceState = Record<string, Array<Partial<PresenceMeta>>>

export function extractOthers(presenceState: PresenceState, selfId: string): PresenceMeta[] {
  const others: PresenceMeta[] = []
  for (const metas of Object.values(presenceState)) {
    for (const meta of metas) {
      if (!meta || meta.id === selfId) continue
      others.push({
        id: typeof meta.id === 'string' ? meta.id : '',
        nickname: sanitizeNickname(typeof meta.nickname === 'string' ? meta.nickname : ''),
        avatar: typeof meta.avatar === 'string' ? meta.avatar : '',
      })
    }
  }
  return others
}

export interface SessionChannelHandlers {
  onStatus: (status: RealtimeStatus) => void
  onPing: (ping: PingEvent) => void
  onPresence: (others: PresenceMeta[]) => void
}

export function openSessionChannel(
  name: string,
  selfId: string,
  presencePayload: PresenceMeta,
  handlers: SessionChannelHandlers,
): RealtimeChannel {
  const channel = supabase.channel(name, {
    config: { broadcast: { self: false } },
  })

  channel.on('broadcast', { event: PING_BROADCAST_EVENT }, ({ payload }) => {
    if (validatePingEvent(payload) && payload.fromId !== selfId) {
      handlers.onPing(payload)
    }
  })

  const syncPresence = () => {
    handlers.onPresence(extractOthers(channel.presenceState() as PresenceState, selfId))
  }

  channel.on('presence', { event: 'sync' }, syncPresence)
  channel.on('presence', { event: 'join' }, syncPresence)
  channel.on('presence', { event: 'leave' }, syncPresence)

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      handlers.onStatus('connected')
      void channel.track(presencePayload)
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
      handlers.onStatus('reconnecting')
    }
  })

  return channel
}

export function broadcastPing(channel: RealtimeChannel, ping: PingEvent): void {
  void channel.send({ type: 'broadcast', event: PING_BROADCAST_EVENT, payload: ping })
}
