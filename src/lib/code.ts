const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
export const CODE_LENGTH = 8

export function generateCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(bytes)
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
  }
  return code
}

export function normalizeCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/0/g, 'O')
    .replace(/1/g, 'I')
    .replace(/8/g, 'B')
    .replace(/[^A-Z2-7]/g, '')
    .slice(0, CODE_LENGTH)
}

export function isValidCode(code: string): boolean {
  return code.length === CODE_LENGTH && [...code].every((c) => CODE_ALPHABET.includes(c))
}

export function formatCode(code: string): string {
  const upper = code.toUpperCase()
  return upper.length === CODE_LENGTH ? `${upper.slice(0, 4)} ${upper.slice(4)}` : upper
}

export function codeChannelName(code: string): string {
  return `ping:code:${code}`
}
