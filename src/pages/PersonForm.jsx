import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PersonForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '',
    birth_date: '',
    phone: '',
    notes: '',
    last_confession: '',
  })
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else if (data)
          setForm({
            name: data.name || '',
            birth_date: data.birth_date || '',
            phone: data.phone || '',
            notes: data.notes || '',
            last_confession: data.last_confession || '',
          })
        setLoading(false)
      })
  }, [id])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function save(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      birth_date: form.birth_date || null,
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
      last_confession: form.last_confession || null,
    }

    let res
    if (isEdit) {
      res = await supabase.from('people').update(payload).eq('id', id)
    } else {
      res = await supabase.from('people').insert(payload)
    }
    setSaving(false)
    if (res.error) {
      setError(res.error.message)
      return
    }
    navigate(isEdit ? `/people/${id}` : '/people')
  }

  if (loading) return <div className="loading">جاري التحميل…</div>

  return (
    <div className="page">
      <h1 className="page-title">{isEdit ? 'تعديل شخص' : 'إضافة شخص'}</h1>

      <form onSubmit={save} className="form card">
        <label>
          الاسم *
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
          />
        </label>
        <label>
          تاريخ الميلاد
          <input
            type="date"
            value={form.birth_date}
            onChange={e => set('birth_date', e.target.value)}
          />
        </label>
        <label>
          رقم التليفون (اختياري)
          <input
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
          />
        </label>
        <label>
          تاريخ آخر اعتراف
          <input
            type="date"
            value={form.last_confession}
            onChange={e => set('last_confession', e.target.value)}
          />
        </label>
        <label>
          ملاحظات
          <textarea
            rows={3}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </label>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'جاري الحفظ…' : 'حفظ'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate(-1)}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}