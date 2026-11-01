import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ChangePassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMsg(null)

    if (password.length < 6) {
      setError('الباسورد لازم يكون 6 حروف على الأقل')
      return
    }
    if (password !== confirm) {
      setError('الباسوردين مش متطابقين')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)

    if (error) {
      setError(error.message)
    } else {
      setMsg('تم تغيير الباسورد بنجاح ✅')
      setPassword('')
      setConfirm('')
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">تغيير كلمة السر</h1>

      <div className="card" style={{ maxWidth: 500 }}>
        <form onSubmit={handleSubmit} className="form">
          <label>
            كلمة السر الجديدة
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="6 حروف على الأقل"
            />
          </label>
          <label>
            تأكيد كلمة السر
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {error && <div className="alert alert-error">{error}</div>}
          {msg && <div className="alert alert-ok">{msg}</div>}

          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'جاري الحفظ…' : 'حفظ كلمة السر'}
          </button>
        </form>
      </div>
    </div>
  )
}