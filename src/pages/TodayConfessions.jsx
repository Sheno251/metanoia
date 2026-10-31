import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { todayISO, formatDateAr } from '../lib/dates'

export default function TodayConfessions() {
  const [people, setPeople] = useState([])
  const [todayList, setTodayList] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [okMsg, setOkMsg] = useState(null)
  // الاسم اللي مستني تأكيد
  const [pendingName, setPendingName] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [peopleRes, todayRes] = await Promise.all([
      supabase.from('people').select('*').order('name'),
      supabase
        .from('confessions')
        .select('*, people(name)')
        .eq('confession_date', todayISO())
        .order('created_at', { ascending: false }),
    ])
    if (!peopleRes.error) setPeople(peopleRes.data || [])
    if (!todayRes.error) setTodayList(todayRes.data || [])
    setLoading(false)
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return people
    return people.filter(p => p.name.includes(search.trim()))
  }, [people, search])

  // تسجيل الاعتراف الفعلي (بعد التأكيد)
  async function addConfession(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    setError(null)
    setOkMsg(null)
    setBusy(true)
    setPendingName(null)

    const existing = people.find(p => p.name === trimmed)
    let personId = existing?.id

    if (!existing) {
      const { data, error: insErr } = await supabase
        .from('people')
        .insert({ name: trimmed, last_confession: todayISO() })
        .select('id')
        .single()
      if (insErr) {
        setError(insErr.message)
        setBusy(false)
        return
      }
      personId = data.id
    } else {
      const { error: updErr } = await supabase
        .from('people')
        .update({
          last_confession: todayISO(),
          followed_up: false,
          followed_up_at: null,
        })
        .eq('id', personId)
      if (updErr) {
        setError(updErr.message)
        setBusy(false)
        return
      }
    }

    const { error: confErr } = await supabase
      .from('confessions')
      .insert({ person_id: personId, confession_date: todayISO() })
    if (confErr) {
      setError(confErr.message)
      setBusy(false)
      return
    }

    setOkMsg(`تم تسجيل اعتراف: ${trimmed} ✅`)
    setSearch('')
    setBusy(false)
    load()
  }

  // لما تدوس على زرار "تسجيل" أو تختار اسم من الاقتراحات
  function askConfirm(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    setError(null)
    setOkMsg(null)
    setPendingName(trimmed)
  }

  if (loading) return <div className="loading">جاري التحميل…</div>

  return (
    <div className="page">
      <h1 className="page-title">اعترافات النهاردة</h1>
      <p className="muted">{formatDateAr(todayISO())}</p>

      <div className="card">
        <h3 className="section-title">تسجيل اعتراف</h3>
        <form
          className="inline-form"
          onSubmit={e => {
            e.preventDefault()
            askConfirm(search)
          }}
        >
          <input
            className="search"
            placeholder="اكتب اسم أو ابحث…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            list="people-list"
          />
          <datalist id="people-list">
            {people.map(p => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>
          <button
            className="btn btn-primary"
            disabled={busy || !search.trim()}
          >
            {busy ? 'جاري التسجيل…' : 'تسجيل'}
          </button>
        </form>

        {search.trim() && filtered.length > 0 && (
          <div className="suggestions">
            {filtered.slice(0, 6).map(p => (
              <button
                key={p.id}
                className="chip"
                onClick={() => askConfirm(p.name)}
                disabled={busy}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}
        {okMsg && <div className="alert alert-ok">{okMsg}</div>}
      </div>

      {/* صندوق تأكيد */}
      {pendingName && (
        <div className="confirm-overlay" onClick={() => setPendingName(null)}>
          <div
            className="confirm-box"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="section-title">تأكيد الاعتراف</h3>
            <p className="confirm-text">
              هل أنت متأكد إنك عايز تسجّل اعتراف النهاردة لـ{' '}
              <strong>{pendingName}</strong>؟
            </p>
            <div className="form-actions">
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={() => addConfession(pendingName)}
              >
                {busy ? 'جاري التسجيل…' : 'تأكيد'}
              </button>
              <button
                className="btn"
                disabled={busy}
                onClick={() => setPendingName(null)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="section-title">
          اللي اعترفوا النهاردة ({todayList.length})
        </h3>
        {todayList.length === 0 ? (
          <p className="muted">لسه مفيش اعترافات مسجلة النهاردة.</p>
        ) : (
          <ul className="list">
            {todayList.map(c => (
              <li key={c.id}>
                <span>{c.people?.name || '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}