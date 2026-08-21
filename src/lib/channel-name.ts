export const CODE_CHANNEL_PREFIX = 'ping:code:'
export const GEO_CHANNEL_PREFIX = 'ping:geo:'

export interface ChannelInfo {
  kind: 'code' | 'geo' | 'unknown'
  raw: string
}

export function codeChannelName(code: string): string {
  return `${CODE_CHANNEL_PREFIX}${code}`
}

export function geoChannelName(cell: string): string {
  return `${GEO_CHANNEL_PREFIX}${cell}`
}

export function parseChannelName(name: string): ChannelInfo {
  if (name.startsWith(CODE_CHANNEL_PREFIX)) {
    return { kind: 'code', raw: name.slice(CODE_CHANNEL_PREFIX.length) }
  }
  if (name.startsWith(GEO_CHANNEL_PREFIX)) {
    return { kind: 'geo', raw: name.slice(GEO_CHANNEL_PREFIX.length) }
  }
  return { kind: 'unknown', raw: name }
}
