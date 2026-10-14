const DAY_MS = 24 * 60 * 60 * 1000

const pad = (n) => String(n).padStart(2, '0')

// Local calendar day as YYYY-MM-DD (the streak and daily goal follow the user's own midnight).
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function yesterdayKey(date = new Date()) {
  return dayKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1))
}

export const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS)
export const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000)

export function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 5) return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function formatRelativeDay(iso, now = new Date()) {
  if (!iso) return 'Never'
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return 'Never'
  const days = Math.floor((new Date(dayKey(now)) - new Date(dayKey(then))) / DAY_MS)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}
