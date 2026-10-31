import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState('login') // login | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    setMsg(null)
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setBusy(false)
    if (error) setError(error.message)
  }

  async function handleReset(e) {
    e.preventDefault()
    setError(null)
    setMsg(null)
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    })
    setBusy(false)
    if (error) setError(error.message)
    else setMsg('تم إرسال رابط استعادة الباسورد على الإيميل ✅')
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="brand brand-center">
          <span className="brand-main">METANOIA</span>
          <span className="brand-sub">ميتانويا</span>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="form">
            <label>
              الإيميل
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="abona@example.com"
              />
            </label>
            <label>
              الباسورد
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </label>
            {error && <div className="alert alert-error">{error}</div>}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'جاري الدخول…' : 'دخول'}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setMode('reset')
                setError(null)
                setMsg(null)
              }}
            >
              نسيت الباسورد؟
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="form">
            <p className="muted">اكتب إيميلك وهنبعتلك رابط استعادة الباسورد.</p>
            <label>
              الإيميل
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>
            {error && <div className="alert alert-error">{error}</div>}
            {msg && <div className="alert alert-ok">{msg}</div>}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'جاري الإرسال…' : 'إرسال رابط الاستعادة'}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setMode('login')
                setError(null)
                setMsg(null)
              }}
            >
              رجوع لتسجيل الدخول
            </button>
          </form>
        )}
      </div>
    </div>
  )
}