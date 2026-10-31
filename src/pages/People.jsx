import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ageFromBirthDate, stageFromAge } from '../lib/stages'
import { reminderLevel, formatDateAr } from '../lib/dates'

export default function People() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('name')
    if (!error) setPeople(data || [])
    setLoading(false)
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return people
    const q = search.trim()
    return people.filter(p => p.name.includes(q))
  }, [people, search])

  if (loading) return <div className="loading">جاري التحميل…</div>

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">الأشخاص</h1>
        <Link to="/people/new" className="btn btn-primary">
          + إضافة شخص
        </Link>
      </div>

      <input
        className="search"
        placeholder="ابحث بالاسم…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="muted">مفيش أشخاص. ابدأ بإضافة شخص جديد.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>السن</th>
                <th>المرحلة</th>
                <th>آخر اعتراف</th>
                <th>التذكير</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const age = ageFromBirthDate(p.birth_date)
                const stage = stageFromAge(age)
                const level = reminderLevel(p.last_confession)
                return (
                  <tr key={p.id} className={'level-' + level}>
                    <td data-label="الاسم">
                      <Link to={`/people/${p.id}`}>{p.name}</Link>
                    </td>
                    <td data-label="السن">{age ?? '—'}</td>
                    <td data-label="المرحلة">{stage?.label ?? '—'}</td>
                    <td data-label="آخر اعتراف">
                      {formatDateAr(p.last_confession)}
                    </td>
                    <td data-label="التذكير">
                      <span className={'badge badge-' + level}>
                        {level === 'red'
                          ? 'متأخر'
                          : level === 'yellow'
                          ? 'قرب الميعاد'
                          : 'منتظم'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}