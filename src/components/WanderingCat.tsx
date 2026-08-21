import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const VISIBLE_MS = 9000
const HIDDEN_MIN_MS = 10000
const HIDDEN_MAX_MS = 15000

export interface CatRange {
  leftMin: number
  leftMax: number
  topMin: number
  topMax: number
}

interface Position {
  left: number
  top: number
}

function randomIn(range: CatRange): Position {
  return {
    left: range.leftMin + Math.random() * (range.leftMax - range.leftMin),
    top: range.topMin + Math.random() * (range.topMax - range.topMin),
  }
}

export function WanderingCat({
  src,
  range,
  sizeClass = 'w-32',
}: {
  src: string
  range: CatRange
  sizeClass?: string
}) {
  const [visible, setVisible] = useState(true)
  const [pos, setPos] = useState<Position>(() => randomIn(range))
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const schedule = () => {
      timerRef.current = window.setTimeout(() => {
        setVisible(false)
        const hiddenMs = HIDDEN_MIN_MS + Math.random() * (HIDDEN_MAX_MS - HIDDEN_MIN_MS)
        timerRef.current = window.setTimeout(() => {
          setPos(randomIn(range))
          setVisible(true)
          schedule()
        }, hiddenMs)
      }, VISIBLE_MS)
    }
    schedule()
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [range])

  return (
    <AnimatePresence>
      {visible && (
        <motion.img
          key={`${src}-${pos.left}-${pos.top}`}
          src={src}
          alt=""
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className={`absolute ${sizeClass}`}
          style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
        />
      )}
    </AnimatePresence>
  )
}
