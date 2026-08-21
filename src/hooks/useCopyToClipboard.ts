import { useCallback, useEffect, useRef, useState } from 'react'

const RESET_DELAY_MS = 1500

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setCopied(false), RESET_DELAY_MS)
    } catch {
      // ignore
    }
  }, [])

  return { copied, copy }
}
