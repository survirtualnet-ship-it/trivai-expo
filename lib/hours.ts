const DIAS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function parseHour(str: string): number {
  const m = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return -1
  let h = parseInt(m[1], 10)
  const mins = parseInt(m[2], 10)
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0
  return h * 60 + mins
}

export function calcIsOpen(hours: Record<string, string> | null | undefined, fallback: boolean): boolean {
  if (!hours) return fallback
  const now = new Date()
  const diaKey = DIAS_ES[now.getDay()]
  const rango = hours[diaKey]
  if (!rango) return fallback
  const lower = rango.toLowerCase().trim()
  if (lower === 'cerrado' || lower === 'closed') return false
  const parts = rango.split('–').map((s: string) => s.trim())
  if (parts.length < 2) return fallback
  const open  = parseHour(parts[0])
  const close = parseHour(parts[1])
  if (open < 0 || close < 0) return fallback
  const nowMins = now.getHours() * 60 + now.getMinutes()
  if (close < open) return nowMins >= open || nowMins < close
  return nowMins >= open && nowMins < close
}