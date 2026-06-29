const PIN_KEY = 'joint-finances-pin'
const SESSION_KEY = 'joint-finances-unlocked'

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function hasPin(): boolean {
  return !!localStorage.getItem(PIN_KEY)
}

export async function setPin(pin: string): Promise<void> {
  const hash = await hashPin(pin)
  localStorage.setItem(PIN_KEY, hash)
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_KEY)
  if (!stored) return true
  const hash = await hashPin(pin)
  return hash === stored
}

export function removePin(): void {
  localStorage.removeItem(PIN_KEY)
}

export function markSessionUnlocked(): void {
  try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* ignore */ }
}

export function isSessionUnlocked(): boolean {
  try { return sessionStorage.getItem(SESSION_KEY) === '1' } catch { return false }
}
