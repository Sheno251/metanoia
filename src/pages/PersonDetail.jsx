import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ageFromBirthDate, stageFromAge } from '../lib/stages'
import { formatDateAr, reminderLevel } from '../lib/dates'

export default function PersonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [person, setPerson] = useState(null)
  const [confessions, setConfessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    setLoading(true)
    const [pRes, cRes] = await Promise.all([
      supabase.from('people').select('*').eq('id', id).single(),
      supabase
        .from('confessions')
        .select('*')
        .eq('person_id', id)
        .order('confession_date', { ascending: false }),
    ])
    if (!pRes.error) setPerson(pRes.data)
    if (!cRes.error) setConfessions(cRes.data || [])
    setLoading(false)
  }

  async function remove() {
    if (!confirm('متأكد إنك عايز تحذف الشخص ده وكل سجل اعترافاته؟')) return
    const { error } = await supabase.from('people').delete().eq('id', id)
    if (!error) navigate('/people')
  }

  if (loading) return <div className="loading">جاري التحميل…</div>
  if (!person) return <p className="muted">الشخص غير موجود.</p>

  const age = ageFromBirthDate(person.birth_date)
  const stage = stageFromAge(age)
  const level = reminderLevel(person.last_confession)

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">{person.name}</h1>
        <div className="row-actions">
          <Link to={`/people/${id}/edit`} className="btn">
            تعديل
          </Link>
          <button className="btn btn-danger" onClick={remove}>
            حذف
          </button>
        </div>
      </div>

      <div className="card detail-grid">
        <div>
          <span className="label">السن</span>
          <span className="value">{age ?? '—'}</span>
        </div>
        <div>
          <span className="label">المرحلة</span>
          <span className="value">{stage?.label ?? '—'}</span>
        </div>
        <div>
          <span className="label">تاريخ الميلاد</span>
          <span className="value">{formatDateAr(person.birth_date)}</span>
        </div>
        <div>
          <span className="label">رقم التليفون</span>
          <span className="value">{person.phone || '—'}</span>
        </div>
        <div>
          <span className="label">آخر اعتراف</span>
          <span className="value">{formatDateAr(person.last_confession)}</span>
        </div>
        <div>
          <span className="label">حالة التذكير</span>
          <span className={'badge badge-' + level}>
            {level === 'red'
              ? 'متأخر'
              : level === 'yellow'
              ? 'قرب الميعاد'
              : 'منتظم'}
          </span>
        </div>
      </div>

      {person.notes && (
        <div className="card">
          <h3 className="section-title">ملاحظات</h3>
          <p className="notes-text">{person.notes}</p>
        </div>
      )}

      <div className="card">
        <h3 className="section-title">سجل الاعترافات</h3>
        {confessions.length === 0 ? (
          <p className="muted">مفيش اعترافات مسجلة.</p>
        ) : (
          <ul className="timeline">
            {confessions.map(c => (
              <li key={c.id}>
                <span className="timeline-date">
                  {formatDateAr(c.confession_date)}
                </span>
                {c.notes && <span className="timeline-note">{c.notes}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}