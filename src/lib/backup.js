import { supabase } from './supabase'

// تصدير كل البيانات JSON
export async function exportBackupJSON() {
  const [peopleRes, confessionsRes] = await Promise.all([
    supabase.from('people').select('*').order('name'),
    supabase.from('confessions').select('*').order('confession_date'),
  ])
  if (peopleRes.error) throw peopleRes.error
  if (confessionsRes.error) throw confessionsRes.error

  const data = {
    exported_at: new Date().toISOString(),
    people: peopleRes.data,
    confessions: confessionsRes.data,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  downloadBlob(blob, `metanoia-backup-${dateStamp()}.json`)
}

// تصدير CSV (يفتح في Excel)
export async function exportBackupCSV() {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .order('name')
  if (error) throw error

  const headers = [
    'name',
    'birth_date',
    'phone',
    'notes',
    'last_confession',
    'followed_up',
    'followed_up_at',
    'created_at',
  ]
  const rows = (data || []).map(p =>
    headers
      .map(h => {
        const v = p[h] ?? ''
        return `"${String(v).replace(/"/g, '""')}"`
      })
      .join(',')
  )
  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `metanoia-people-${dateStamp()}.csv`)
}

// استيراد من JSON
export async function importBackupJSON(file) {
  const text = await file.text()
  const data = JSON.parse(text)
  if (!data.people || !Array.isArray(data.people)) {
    throw new Error('ملف غير صالح: مفيش قائمة people')
  }

  // نضيف الأشخاص
  const peopleToInsert = data.people.map(p => ({
    name: p.name,
    birth_date: p.birth_date || null,
    phone: p.phone || null,
    notes: p.notes || null,
    last_confession: p.last_confession || null,
    followed_up: !!p.followed_up,
    followed_up_at: p.followed_up_at || null,
  }))

  if (peopleToInsert.length) {
    const { error } = await supabase.from('people').insert(peopleToInsert)
    if (error) throw error
  }
  return peopleToInsert.length
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function dateStamp() {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`
}