import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { reminderLevel, needsFollowUp, todayISO, isToday } from '../lib/dates'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [peopleRes, confTodayRes] = await Promise.all([
      supabase.from('people').select('id, last_confession, followed_up'),
      supabase
        .from('confessions')
        .select('id', { count: 'exact', head: true })
        .eq('confession_date', todayISO()),
    ])

    const people = peopleRes.data || []
    const followUps = people.filter(
      p => !p.followed_up && needsFollowUp({ last_confession: p.last_confession })
    ).length
    const reds = people.filter(
      p => reminderLevel(p.last_confession) === 'red'
    ).length
    const yellows = people.filter(
      p => reminderLevel(p.last_confession) === 'yellow'
    ).length

    setStats({
      total: people.length,
      todayConfessions: confTodayRes.count || 0,
      followUps,
      reds,
      yellows,
    })
    setLoading(false)
  }

  if (loading) return <div className="loading">جاري التحميل…</div>

  return (
    <div className="page">
      <h1 className="page-title">الرئيسية</h1>

      <div className="stats-grid">
        <StatCard label="عدد الأشخاص" value={stats.total} />
        <StatCard label="اعترافات النهاردة" value={stats.todayConfessions} />
        <StatCard label="محتاجين متابعة" value={stats.followUps} accent="warn" />
        <StatCard label="متأخرين (3 شهور+)" value={stats.reds} accent="danger" />
        <StatCard label="قرب الميعاد (شهرين)" value={stats.yellows} accent="warn" />
      </div>

      <div className="quick-actions">
        <Link to="/today" className="btn btn-primary">
          اعترف النهاردة
        </Link>
        <Link to="/people/new" className="btn">
          إضافة شخص جديد
        </Link>
        <Link to="/people" className="btn">
          كل الأشخاص
        </Link>
        <Link to="/follow-ups" className="btn">
          محتاجين متابعة
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className={'stat-card' + (accent ? ' ' + accent : '')}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}