import { decode_bbox } from 'ngeohash'
import { describe, expect, it } from 'vitest'

import { cellForCoords } from './geohash'

function cellSizeDegrees(cell: string): { lat: number; lng: number } {
  const [minLat, minLng, maxLat, maxLng] = decode_bbox(cell)
  return { lat: maxLat - minLat, lng: maxLng - minLng }
}

describe('cellForCoords precision mapping', () => {
  const lat = 52.52
  const lng = 13.405

  it('maps ~150m to a 7-char cell', () => {
    const cell = cellForCoords(lat, lng, 'near')
    expect(cell).toHaveLength(7)
    const { lat: latSpan } = cellSizeDegrees(cell)
    expect(latSpan).toBeGreaterThan(0.001)
    expect(latSpan).toBeLessThan(0.002)
  })

  it('maps ~1km to a 6-char cell', () => {
    const cell = cellForCoords(lat, lng, 'far')
    expect(cell).toHaveLength(6)
    const { lat: latSpan } = cellSizeDegrees(cell)
    expect(latSpan).toBeGreaterThan(0.004)
    expect(latSpan).toBeLessThan(0.006)
  })

  it('is deterministic for a given radius', () => {
    expect(cellForCoords(lat, lng, 'near')).toBe(cellForCoords(lat, lng, 'near'))
  })
})
