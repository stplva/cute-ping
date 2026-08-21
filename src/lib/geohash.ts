import { encode } from 'ngeohash'

export type RadiusOption = 'near' | 'far'

export const RADIUS_LABELS: Record<RadiusOption, string> = {
  near: '~150m',
  far: '~1km',
}

export const RADIUS_PRECISION: Record<RadiusOption, number> = {
  near: 7,
  far: 6,
}

export function cellForCoords(latitude: number, longitude: number, radius: RadiusOption): string {
  return encode(latitude, longitude, RADIUS_PRECISION[radius])
}
