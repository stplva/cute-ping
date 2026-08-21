import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'

import {
  broadcastPing,
  openSessionChannel,
  type PresenceMeta,
  type RealtimeStatus,
} from '@/lib/channel'
import { getSessionId } from '@/lib/identity'
import { createPingEvent, type PingEmoji, type PingEvent } from '@/lib/protocol'
import { supabase } from '@/lib/supabase'

const PING_MIN_INTERVAL_MS = 150

export type SendResult =
  | { kind: 'throttled' }
  | { kind: 'no-peers' }
  | { kind: 'sent'; recipients: number }

export function useRealtimeSession() {
  const [status, setStatus] = useState<RealtimeStatus>('connecting')
  const [others, setOthers] = useState<PresenceMeta[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)
  const othersRef = useRef<PresenceMeta[]>([])
  const pingHandlerRef = useRef<(ping: PingEvent) => void>(() => {})
  const lastSendRef = useRef(0)

  const setPingHandler = useCallback((handler: (ping: PingEvent) => void) => {
    pingHandlerRef.current = handler
  }, [])

  const updateOthers = useCallback((next: PresenceMeta[]) => {
    othersRef.current = next
    setOthers(next)
  }, [])

  const join = useCallback(
    async (channelName: string, presence: { nickname: string; avatar: string }) => {
      const previous = channelRef.current
      channelRef.current = null
      if (previous) {
        await supabase.removeChannel(previous)
      }

      const selfId = getSessionId()
      updateOthers([])
      setStatus('connecting')

      const channel = openSessionChannel(
        channelName,
        selfId,
        { id: selfId, ...presence },
        {
          onStatus: setStatus,
          onPing: (ping) => pingHandlerRef.current(ping),
          onPresence: updateOthers,
        },
      )
      channelRef.current = channel
    },
    [updateOthers],
  )

  const leave = useCallback(async () => {
    const channel = channelRef.current
    channelRef.current = null
    if (channel) {
      await supabase.removeChannel(channel)
    }
    updateOthers([])
    setStatus('connecting')
  }, [updateOthers])

  const sendPing = useCallback((emoji: PingEmoji): SendResult => {
    const channel = channelRef.current
    if (!channel) return { kind: 'no-peers' }

    const recipients = othersRef.current.length
    if (recipients === 0) return { kind: 'no-peers' }

    const now = Date.now()
    if (now - lastSendRef.current < PING_MIN_INTERVAL_MS) {
      return { kind: 'throttled' }
    }
    lastSendRef.current = now

    broadcastPing(channel, createPingEvent(getSessionId(), emoji))
    return { kind: 'sent', recipients }
  }, [])

  useEffect(() => {
    return () => {
      const channel = channelRef.current
      if (channel) {
        void supabase.removeChannel(channel)
      }
    }
  }, [])

  return { status, others, join, leave, sendPing, setPingHandler }
}
