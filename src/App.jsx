import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import People from './pages/People'
import PersonForm from './pages/PersonForm'
import PersonDetail from './pages/PersonDetail'
import TodayConfessions from './pages/TodayConfessions'
import WeekConfessions from './pages/WeekConfessions'
import FollowUps from './pages/FollowUps'
import FollowedUp from './pages/FollowedUp'
import Backup from './pages/Backup'
import MonthlyReport from './pages/MonthlyReport'

export default function App() {
  const [session, setSession] = useState(undefined)
  const location = useLocation()

  // لو الرابط فيه علامات استعادة باسورد، منعرضهوش في الـ Layout
  const isRecoveryPath =
    location.pathname === '/reset-password' ||
    (window.location.hash || '').includes('type=recovery') ||
    (window.location.search || '').includes('type=recovery')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // مسار الاستعادة دايماً متاح (سواء فيه session أو لأ)
  if (isRecoveryPath) {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/reset-password" replace />} />
      </Routes>
    )
  }

  if (session === undefined) {
    return <div className="loading">جاري التحميل…</div>
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/people" element={<People />} />
        <Route path="/people/new" element={<PersonForm />} />
        <Route path="/people/:id" element={<PersonDetail />} />
        <Route path="/people/:id/edit" element={<PersonForm />} />
        <Route path="/today" element={<TodayConfessions />} />
        <Route path="/week" element={<WeekConfessions />} />
        <Route path="/monthly" element={<MonthlyReport />} />
        <Route path="/follow-ups" element={<FollowUps />} />
        <Route path="/followed-up" element={<FollowedUp />} />
        <Route path="/backup" element={<Backup />} />
        <Route
          path="/login"
          element={<Navigate to="/" replace state={{ from: location }} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}