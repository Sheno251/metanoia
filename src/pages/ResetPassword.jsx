import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()

  // الخطوة 1: التحقق من الرمز
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [verified, setVerified] = useState(false)

  // الخطوة 2: تعيين الباسورد الجديد
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [error, setError] = useState(null)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError(null)
    setMsg(null)

    if (!email.trim()) {
      setError('اكتب الإيميل')
      return
    }
    if (!otp.trim()) {
      setError('اكتب الرمز اللي وصلك في الإيميل')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'recovery',
    })
    setBusy(false)

    if (error) {
      setError(error.message)
    } else {
      setVerified(true)
      setMsg('تم التحقق ✅ اكتب الباسورد الجديد')
    }
  }

  async function handleUpdatePassword(e) {
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

        {done ? (
          <>
            <h2 style={{ textAlign: 'center', color: 'var(--navy)', marginTop: 0 }}>
              تم بنجاح ✅
            </h2>
            <div className="alert alert-ok" style={{ textAlign: 'center' }}>
              تم تغيير الباسورد بنجاح
              <br />
              جاري تحويلك لتسجيل الدخول…
            </div>
          </>
        ) : !verified ? (
          <>
            <h2 style={{ textAlign: 'center', color: 'var(--navy)', marginTop: 0 }}>
              استعادة كلمة السر
            </h2>
            <p className="muted" style={{ textAlign: 'center' }}>
              اكتب الإيميل والرمز اللي وصلك في الإيميل
            </p>

            <form onSubmit={handleVerifyOtp} className="form">
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
                رمز التحقق (من الإيميل)
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  inputMode="numeric"
                  placeholder="123456"
                  style={{
                    textAlign: 'center',
                    fontSize: 22,
                    letterSpacing: 6,
                    fontFamily: 'monospace',
                  }}
                />
              </label>

              {error && <div className="alert alert-error">{error}</div>}
              {msg && <div className="alert alert-ok">{msg}</div>}

              <button className="btn btn-primary" disabled={busy}>
                {busy ? 'جاري التحقق…' : 'تحقق'}
              </button>
              <button
                type="button"
                className="link-btn"
                onClick={() => navigate('/login')}
              >
                رجوع لتسجيل الدخول
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', color: 'var(--navy)', marginTop: 0 }}>
              كلمة سر جديدة
            </h2>
            <p className="muted" style={{ textAlign: 'center' }}>
              اكتب كلمة السر الجديدة
            </p>

            <form onSubmit={handleUpdatePassword} className="form">
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
          </>
        )}
      </div>
    </div>
  )
}