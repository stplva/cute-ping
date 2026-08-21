import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { PresenceIndicator } from '@/components/PresenceIndicator'

import { formatCode } from '@/lib/code'
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
      <span className="pointer-events-none absolute text-7xl" style={{ left: x, top: y }}>
        {emoji}
      </span>
    )
  }
  return (
    <motion.span
      className="pointer-events-none absolute text-7xl"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.2, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scale: 2, y: -160 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
    >
      {emoji}
    </motion.span>
  )
}

function roomInfo(channelName: string): { label: string; raw: string; isCode: boolean } {
  if (channelName.startsWith('ping:code:')) {
    const raw = channelName.slice('ping:code:'.length)
    return { label: formatCode(raw), raw, isCode: true }
  }
  if (channelName.startsWith('ping:geo:')) {
    const raw = channelName.slice('ping:geo:'.length)
    return { label: raw, raw, isCode: false }
  }
  return { label: channelName, raw: channelName, isCode: false }
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
  const [copied, setCopied] = useState(false)
  const [hasTapped, setHasTapped] = useState(false)
  const reduced = usePrefersReducedMotion()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef(0)
  const noticeTimerRef = useRef<number | null>(null)

  const room = roomInfo(channelName)

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

  const copyRoom = async () => {
    try {
      await navigator.clipboard.writeText(room.raw)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable; the code is still visible
    }
  }

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
    setHasTapped(true)
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const result = sendPing(selectedEmoji)
    if (result.kind === 'sent') {
      spawn(selectedEmoji, x, y)
      if (result.recipients === 0) {
        showNotice('Sent into the void… 👻 invite a friend!')
      } else {
        showNotice(`Sent to ${result.recipients} ${result.recipients === 1 ? 'friend' : 'friends'} 💌`)
      }
    }
  }

  return (
    <div ref={containerRef} className="relative h-svh w-full overflow-hidden">
      <div className="absolute inset-0 z-0" onClick={handleCanvasTap} aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0 z-10">
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

      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-4">
        <div className="flex flex-col gap-2">
          <PresenceIndicator status={status} others={others} />
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-white/85 px-3 py-1 font-mono text-sm shadow-sm">
              {room.isCode ? '🔗 ' : '📍 '}
              {room.label}
            </span>
            <button
              type="button"
              onClick={copyRoom}
              className="rounded-full bg-white/85 px-2.5 py-1 text-xs shadow-sm transition-colors hover:bg-white"
            >
              {copied ? 'copied ✓' : 'copy'}
            </button>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-transparent bg-white/85 shadow-sm transition-colors hover:bg-white"
          onClick={onLeave}
        >
          Leave
        </Button>
      </div>

      {notice && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center px-4">
          <span className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground shadow-lg">
            {notice}
          </span>
        </div>
      )}

      {!hasTapped && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center px-4">
          <span className="rounded-full bg-white/70 px-4 py-2 text-sm text-foreground/70 shadow-sm">
            tap anywhere to send a ping 💌
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center gap-2 p-4">
        {PING_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => setSelectedEmoji(emoji)}
            aria-pressed={selectedEmoji === emoji}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl backdrop-blur-xl transition-transform ${
              selectedEmoji === emoji
                ? 'scale-110 bg-white/90 ring-2 ring-white'
                : 'bg-white/50 shadow-sm hover:bg-white/80'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
