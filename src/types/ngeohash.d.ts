declare module 'ngeohash' {
  export function encode(
    latitude: number,
    longitude: number,
    precision?: number,
  ): string

  export function decode_bbox(hash: string): [number, number, number, number]

  export function neighbors(hash: string): string[]
}
