import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState('login') // login | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  // حالة استعادة الباسورد
  const [isRecovery, setIsRecovery] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    // 1) فحص مباشر للرابط (الأهم) – بيمسك لينك الاستعادة قبل أي حاجة
    const hash = window.location.hash || ''
    const search = window.location.search || ''
    if (
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      hash.includes('access_token')
    ) {
      setIsRecovery(true)
    }

    // 2) الاستماع لحدث Supabase كاحتياطي
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecovery(true)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

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

  async function handleUpdatePassword(e) {
    e.preventDefault()
    setError(null)
    setMsg(null)

    if (newPassword.length < 6) {
      setError('الباسورد لازم يكون 6 حروف على الأقل')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('الباسوردين مش متطابقين')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setBusy(false)

    if (error) {
      setError(error.message)
    } else {
      setMsg('تم تغيير الباسورد بنجاح ✅ هتقدر تدخل بالباسورد الجديد')
      setIsRecovery(false)
      setNewPassword('')
      setConfirmPassword('')
      await supabase.auth.signOut()
      // ننضف الرابط من hash عشان لو عمل refresh ميفضلش في وضع الاستعادة
      window.history.replaceState(null, '', window.location.pathname)
    }
  }

  // ===== شاشة تغيير الباسورد =====
  if (isRecovery) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="brand brand-center">
            <span className="brand-main">METANOIA</span>
            <span className="brand-sub">ميتانويا</span>
          </div>

          <h2 style={{ textAlign: 'center', color: 'var(--navy)', marginTop: 0 }}>
            تغيير كلمة السر
          </h2>
          <p className="muted" style={{ textAlign: 'center' }}>
            اكتب كلمة السر الجديدة
          </p>

          <form onSubmit={handleUpdatePassword} className="form">
            <label>
              كلمة السر الجديدة
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="6 حروف على الأقل"
              />
            </label>
            <label>
              تأكيد كلمة السر
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>

            {error && <div className="alert alert-error">{error}</div>}
            {msg && <div className="alert alert-ok">{msg}</div>}

            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'جاري الحفظ…' : 'حفظ كلمة السر'}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={async () => {
                await supabase.auth.signOut()
                setIsRecovery(false)
                window.history.replaceState(null, '', window.location.pathname)
              }}
            >
              إلغاء
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ===== شاشة تسجيل الدخول / نسيت الباسورد =====
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