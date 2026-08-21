import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { PresenceIndicator } from '@/components/PresenceIndicator'

import { sanitizeNickname } from '@/lib/identity'
import { PING_EMOJIS, type PingEmoji, type PingEvent } from '@/lib/protocol'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useRealtimeSession } from '@/hooks/useRealtimeSession'

interface FloatingItem {
  id: number
  emoji: string
  x: number
  y: number
}

function FloatingEmoji({
  emoji,
  x,
  y,
  reduced,
}: {
  emoji: string
  x: number
  y: number
  reduced: boolean
}) {
  if (reduced) {
    return (
      <span className="pointer-events-none absolute text-4xl" style={{ left: x, top: y }}>
        {emoji}
      </span>
    )
  }
  return (
    <motion.span
      className="pointer-events-none absolute text-4xl"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.4, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scale: 1, y: -140 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.6, ease: 'easeOut' }}
    >
      {emoji}
    </motion.span>
  )
}

export function PingCanvas({
  channelName,
  nickname,
  avatar,
  onLeave,
}: {
  channelName: string
  nickname: string
  avatar: string
  onLeave: () => void
}) {
  const { status, others, join, leave, sendPing, setPingHandler } = useRealtimeSession()
  const [selectedEmoji, setSelectedEmoji] = useState<PingEmoji>(PING_EMOJIS[0])
  const [floating, setFloating] = useState<FloatingItem[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const reduced = usePrefersReducedMotion()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef(0)
  const noticeTimerRef = useRef<number | null>(null)

  const spawn = useCallback((emoji: string, x: number, y: number) => {
    const id = ++idRef.current
    setFloating((prev) => [...prev, { id, emoji, x, y }])
    window.setTimeout(() => {
      setFloating((prev) => prev.filter((item) => item.id !== id))
    }, 1700)
  }, [])

  const showNotice = useCallback((text: string) => {
    setNotice(text)
    if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 2000)
  }, [])

  const handleIncomingPing = useCallback(
    (ping: PingEvent) => {
      const width = containerRef.current?.clientWidth ?? window.innerWidth
      const height = containerRef.current?.clientHeight ?? window.innerHeight
      const x = Math.random() * Math.max(width - 80, 0)
      const y = 40 + Math.random() * Math.max(height - 160, 0)
      spawn(ping.emoji, x, y)
    },
    [spawn],
  )

  useEffect(() => {
    setPingHandler(handleIncomingPing)
  }, [setPingHandler, handleIncomingPing])

  useEffect(() => {
    void join(channelName, { nickname: sanitizeNickname(nickname), avatar })
    return () => {
      void leave()
    }
  }, [join, leave, channelName, nickname, avatar])

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current)
    }
  }, [])

  const handleCanvasTap = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const result = sendPing(selectedEmoji)
    if (result.kind === 'no-peers') {
      showNotice('No one is here yet — share your code to invite friends!')
    } else if (result.kind === 'sent') {
      showNotice(`Sent to ${result.recipients} ${result.recipients === 1 ? 'friend' : 'friends'} 💌`)
      spawn(selectedEmoji, x, y)
    }
  }

  return (
    <div ref={containerRef} className="relative h-svh w-full overflow-hidden bg-gradient-to-b from-background to-secondary/40">
      <div className="absolute inset-0" onClick={handleCanvasTap} aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0">
        <AnimatePresence>
          {floating.map((item) => (
            <FloatingEmoji
              key={item.id}
              emoji={item.emoji}
              x={item.x}
              y={item.y}
              reduced={reduced}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4">
        <PresenceIndicator status={status} others={others} />
        <Button variant="outline" size="sm" onClick={onLeave}>
          Leave
        </Button>
      </div>

      {notice && (
        <div className="absolute inset-x-0 top-16 z-10 flex justify-center px-4">
          <span className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground shadow">
            {notice}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center gap-2 p-4">
        {PING_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => setSelectedEmoji(emoji)}
            aria-pressed={selectedEmoji === emoji}
            className={`flex h-12 w-12 items-center justify-center rounded-full border text-2xl transition-transform ${
              selectedEmoji === emoji
                ? 'scale-110 border-primary bg-primary/10'
                : 'border-border bg-background hover:scale-105'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
