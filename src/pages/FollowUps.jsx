import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { reminderLevel, needsFollowUp, formatDateAr } from '../lib/dates'

export default function FollowUps() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('followed_up', false)
      .order('last_confession', { ascending: true, nullsFirst: true })
    if (!error) {
      setPeople((data || []).filter(p => needsFollowUp(p)))
    }
    setLoading(false)
  }

  async function markFollowedUp(id) {
    setBusyId(id)
    const { error } = await supabase
      .from('people')
      .update({ followed_up: true, followed_up_at: new Date().toISOString() })
      .eq('id', id)
    setBusyId(null)
    if (!error) load()
  }

  if (loading) return <div className="loading">جاري التحميل…</div>

  return (
    <div className="page">
      <h1 className="page-title">محتاجين متابعة</h1>
      <p className="muted">
        الأشخاص اللي عدّى عليهم شهرين أو أكتر من غير اعتراف.
      </p>

      {people.length === 0 ? (
        <p className="muted">مفيش حد محتاج متابعة دلوقتي. 🎉</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>آخر اعتراف</th>
                <th>الحالة</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {people.map(p => {
                const level = reminderLevel(p.last_confession)
                return (
                  <tr key={p.id} className={'level-' + level}>
                    <td data-label="الاسم">
                      <Link to={`/people/${p.id}`}>{p.name}</Link>
                    </td>
                    <td data-label="آخر اعتراف">
                      {formatDateAr(p.last_confession)}
                    </td>
                    <td data-label="الحالة">
                      <span className={'badge badge-' + level}>
                        {level === 'red' ? 'متأخر' : 'قرب الميعاد'}
                      </span>
                    </td>
                    <td data-label="إجراء">
                      <button
                        className="btn btn-small"
                        disabled={busyId === p.id}
                        onClick={() => markFollowedUp(p.id)}
                      >
                        {busyId === p.id ? '…' : 'تم المتابعة'}
                      </button>
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