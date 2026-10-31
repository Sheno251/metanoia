// أدوات تواريخ ومساعدات التذكير

export function todayISO() {
  const d = new Date()
  const tz = d.getTimezoneOffset()
  const local = new Date(d.getTime() - tz * 60000)
  return local.toISOString().slice(0, 10)
}

export function daysBetween(fromISO, toISO = todayISO()) {
  if (!fromISO) return null
  const from = new Date(fromISO + 'T00:00:00')
  const to = new Date(toISO + 'T00:00:00')
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null
  return Math.floor((to - from) / (1000 * 60 * 60 * 24))
}

export function monthsSince(dateISO) {
  const days = daysBetween(dateISO)
  if (days == null) return null
  return days / 30.44
}

// لون التذكير
// أخضر: أقل من شهرين
// أصفر: من شهرين لـ 3 شهور
// أحمر: 3 شهور أو أكثر
export function reminderLevel(lastConfession) {
  if (!lastConfession) return 'red' // مفيش اعتراف مسجل
  const m = monthsSince(lastConfession)
  if (m == null) return 'red'
  if (m >= 3) return 'red'
  if (m >= 2) return 'yellow'
  return 'green'
}

export function needsFollowUp(person) {
  const level = reminderLevel(person.last_confession)
  return level === 'red' || level === 'yellow'
}

export function formatDateAr(iso) {
  if (!iso) return '—'
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''))
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function isWithinLastDays(dateISO, days) {
  const diff = daysBetween(dateISO)
  if (diff == null) return false
  return diff >= 0 && diff < days
}

export function isToday(dateISO) {
  return dateISO === todayISO()
}