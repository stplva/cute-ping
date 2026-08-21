import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Position {
  left: number
  top: number
}

interface KittenDef {
  src: string
  size: string
}

interface PlacedItem extends Position {
  key: string
  kind: 'cat' | 'sparkle'
  src: string
  size: string
}

const BASE_KITTENS: KittenDef[] = [
  { src: '/sleepy.gif', size: 'w-32' },
  { src: '/hellokitty.gif', size: 'w-28' },
  { src: '/cat.gif', size: 'w-28' },
  { src: '/cat2.gif', size: 'w-28' },
]

const SPARKLE_SRC = '/sparkles.gif'
const SPARKLE_SIZE = 'w-32'
const SPARKLE_EVERY = 3

const BASE_COUNT = BASE_KITTENS.length
const MAX_CATS = 12
const INSTANCES: KittenDef[] = Array.from(
  { length: MAX_CATS },
  (_, i) => BASE_KITTENS[i % BASE_COUNT],
)

const STOP_MS = 2000
const COOLDOWN_MS = 4000
const WANDER_VISIBLE_MIN_MS = 5000
const WANDER_VISIBLE_MAX_MS = 12000
const WANDER_HIDDEN_MIN_MS = 5000
const WANDER_HIDDEN_MAX_MS = 12000
const MIN_DISTANCE_PX = 160
const PICK_ATTEMPTS = 24

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomPosition(): Position {
  return { left: randomBetween(3, 66), top: randomBetween(10, 70) }
}

function distance(a: Position, b: Position): number {
  const dx = ((a.left - b.left) / 100) * window.innerWidth
  const dy = ((a.top - b.top) / 100) * window.innerHeight
  return Math.hypot(dx, dy)
}

function pickPosition(occupied: Position[]): Position {
  let best = randomPosition()
  let bestClearance = Number.NEGATIVE_INFINITY
  for (let i = 0; i < PICK_ATTEMPTS; i++) {
    const candidate = randomPosition()
    if (occupied.length === 0) return candidate
    let clearance = Number.POSITIVE_INFINITY
    for (const p of occupied) {
      clearance = Math.min(clearance, distance(p, candidate))
    }
    if (clearance >= MIN_DISTANCE_PX) return candidate
    if (clearance > bestClearance) {
      bestClearance = clearance
      best = candidate
    }
  }
  return best
}

function makeSteps(): number[] {
  return Array.from({ length: MAX_CATS }, () => 7 + Math.floor(Math.random() * 4))
}

function shuffleBase(): number[] {
  const indices = Array.from({ length: BASE_COUNT }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = indices[i]
    indices[i] = indices[j]
    indices[j] = temp
  }
  return indices
}

function makeOrder(): number[] {
  const duplicates = Array.from({ length: MAX_CATS - BASE_COUNT }, (_, i) => BASE_COUNT + i)
  return [...shuffleBase(), ...duplicates]
}

export function Kittens({ taps }: { taps: number }) {
  const [steps] = useState(makeSteps)
  const [order] = useState(makeOrder)
  const [visible, setVisible] = useState<PlacedItem[]>([])
  const [stoppedForTaps, setStoppedForTaps] = useState<number | null>(null)
  const [idleSince, setIdleSince] = useState(0)

  const visibleRef = useRef<PlacedItem[]>([])
  const baseRef = useRef(0)
  const tappingRef = useRef(false)

  const tapping = taps > 0 && stoppedForTaps !== taps
  const idle = !tapping && idleSince === taps

  const placeItem = useCallback((key: string, kind: 'cat' | 'sparkle', src: string, size: string) => {
    const occupied = visibleRef.current.map((k) => ({ left: k.left, top: k.top }))
    const position = pickPosition(occupied)
    visibleRef.current = [...visibleRef.current, { key, kind, src, size, ...position }]
    setVisible(visibleRef.current)
  }, [])

  const addKitten = useCallback(
    (index: number) => {
      const def = INSTANCES[index]
      placeItem(`cat-${index}`, 'cat', def.src, def.size)
    },
    [placeItem],
  )

  const addSparkle = useCallback(
    (n: number) => {
      placeItem(`sparkle-${n}`, 'sparkle', SPARKLE_SRC, SPARKLE_SIZE)
    },
    [placeItem],
  )

  const removeKitten = useCallback((index: number) => {
    visibleRef.current = visibleRef.current.filter((k) => k.key !== `cat-${index}`)
    setVisible(visibleRef.current)
  }, [])

  useEffect(() => {
    const wasTapping = tappingRef.current
    tappingRef.current = tapping
    if (tapping && !wasTapping) {
      baseRef.current = visibleRef.current.filter((k) => k.kind === 'cat').length
    }
  }, [tapping])

  useEffect(() => {
    if (taps === 0) return
    const timer = window.setTimeout(() => {
      setStoppedForTaps(taps)
      visibleRef.current = []
      setVisible([])
    }, STOP_MS)
    return () => window.clearTimeout(timer)
  }, [taps])

  useEffect(() => {
    if (stoppedForTaps === null) return
    const timer = window.setTimeout(() => setIdleSince(stoppedForTaps), COOLDOWN_MS)
    return () => window.clearTimeout(timer)
  }, [stoppedForTaps])

  useEffect(() => {
    if (!idle) return
    let cancelled = false
    const timers: number[] = []
    const schedule = (index: number, isVisible: boolean) => {
      const delay = isVisible
        ? randomBetween(WANDER_VISIBLE_MIN_MS, WANDER_VISIBLE_MAX_MS)
        : randomBetween(WANDER_HIDDEN_MIN_MS, WANDER_HIDDEN_MAX_MS)
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return
          if (isVisible) removeKitten(index)
          else addKitten(index)
          schedule(index, !isVisible)
        }, delay),
      )
    }
    for (let i = 0; i < BASE_COUNT; i++) schedule(i, false)
    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [idle, addKitten, removeKitten])

  const sessionTaps = taps - (stoppedForTaps ?? 0)
  let revealedCats = 0
  let acc = 0
  for (let k = 0; k < steps.length; k++) {
    acc += steps[k]
    if (sessionTaps >= acc) revealedCats++
    else break
  }

  useEffect(() => {
    if (!tapping) return
    const current = visibleRef.current
    const catIds = new Set(current.filter((k) => k.kind === 'cat').map((k) => k.key))
    const sparkleCount = current.filter((k) => k.kind === 'sparkle').length
    const targetCats = Math.min(MAX_CATS, baseRef.current + revealedCats)
    const targetSparkles = Math.floor(targetCats / SPARKLE_EVERY)

    const remaining = order.filter((index) => !catIds.has(`cat-${index}`))
    for (let k = 0; k < targetCats - catIds.size && k < remaining.length; k++) {
      addKitten(remaining[k])
    }
    for (let s = sparkleCount; s < targetSparkles; s++) {
      addSparkle(s)
    }
  }, [tapping, revealedCats, order, addKitten, addSparkle])

  return (
    <AnimatePresence>
      {visible.map((item) => (
        <motion.img
          key={item.key}
          src={item.src}
          alt=""
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.4 }}
          className={`absolute ${item.size}`}
          style={{ left: `${item.left}%`, top: `${item.top}%` }}
        />
      ))}
    </AnimatePresence>
  )
}
