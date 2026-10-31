import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { daysBetween, formatDateAr, todayISO } from '../lib/dates'

export default function WeekConfessions() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const since = new Date()
    since.setDate(since.getDate() - 6)
    const sinceISO = since.toISOString().slice(0, 10)

    const { data, error } = await supabase
      .from('confessions')
      .select('id, confession_date, people(name)')
      .gte('confession_date', sinceISO)
      .lte('confession_date', todayISO())
      .order('confession_date', { ascending: false })

    if (!error) setRows(data || [])
    setLoading(false)
  }

  const grouped = rows.reduce((acc, r) => {
    const key = r.confession_date
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  const total = rows.length
  const uniquePeople = new Set(rows.map(r => r.people?.name).filter(Boolean)).size

  if (loading) return <div className="loading">جاري التحميل…</div>

  return (
    <div className="page">
      <h1 className="page-title">اعترافات الأسبوع</h1>
      <p className="muted">آخر 7 أيام</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">إجمالي الاعترافات</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{uniquePeople}</div>
          <div className="stat-label">أشخاص مختلفين</div>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p className="muted">مفيش اعترافات في آخر 7 أيام.</p>
      ) : (
        Object.entries(grouped).map(([date, list]) => (
          <div className="card" key={date}>
            <h3 className="section-title">
              {formatDateAr(date)}{' '}
              <span className="muted">({list.length})</span>
            </h3>
            <ul className="list">
              {list.map(r => (
                <li key={r.id}>{r.people?.name || '—'}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}