import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatDateAr } from '../lib/dates'

export default function FollowedUp() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('followed_up', true)
      .order('followed_up_at', { ascending: false })
    if (!error) setPeople(data || [])
    setLoading(false)
  }

  async function undo(id) {
    const { error } = await supabase
      .from('people')
      .update({ followed_up: false, followed_up_at: null })
      .eq('id', id)
    if (!error) load()
  }

  if (loading) return <div className="loading">جاري التحميل…</div>

  return (
    <div className="page">
      <h1 className="page-title">تمت متابعتهم</h1>
      <p className="muted">الأشخاص اللي تمت متابعتهم — عشان متنساهمش.</p>

      {people.length === 0 ? (
        <p className="muted">مفيش حد تمت متابعته لسه.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>آخر اعتراف</th>
                <th>تاريخ المتابعة</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {people.map(p => (
                <tr key={p.id}>
                  <td data-label="الاسم">
                    <Link to={`/people/${p.id}`}>{p.name}</Link>
                  </td>
                  <td data-label="آخر اعتراف">
                    {formatDateAr(p.last_confession)}
                  </td>
                  <td data-label="تاريخ المتابعة">
                    {p.followed_up_at
                      ? new Date(p.followed_up_at).toLocaleDateString('ar-EG')
                      : '—'}
                  </td>
                  <td data-label="إجراء">
                    <button
                      className="btn btn-small btn-ghost"
                      onClick={() => undo(p.id)}
                    >
                      رجّع للقائمة
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}