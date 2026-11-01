import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

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
      setDone(true)
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="brand brand-center">
          <span className="brand-main">METANOIA</span>
          <span className="brand-sub">ميتانويا</span>
        </div>

        <h2 style={{ textAlign: 'center', color: 'var(--navy)', marginTop: 0 }}>
          كلمة سر جديدة
        </h2>
        <p className="muted" style={{ textAlign: 'center' }}>
          اكتب كلمة السر الجديدة
        </p>

        {done ? (
          <div className="alert alert-ok" style={{ textAlign: 'center' }}>
            تم تغيير الباسورد بنجاح ✅
            <br />
            جاري تحويلك لتسجيل الدخول…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form">
            <label>
              الباسورد الجديد
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
              تأكيد الباسورد
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={6}
              />
            </label>

            {error && <div className="alert alert-error">{error}</div>}

            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'جاري الحفظ…' : 'حفظ كلمة السر'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}