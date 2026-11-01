import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const links = [
  { to: '/', label: 'الرئيسية', icon: '🏠', end: true },
  { to: '/people', label: 'الأشخاص', icon: '👥' },
  { to: '/today', label: 'اعترافات النهاردة', icon: '📅' },
  { to: '/week', label: 'اعترافات الأسبوع', icon: '📊' },
  { to: '/monthly', label: 'التقرير الشهري', icon: '📄' },
  { to: '/follow-ups', label: 'محتاجين متابعة', icon: '⏰' },
  { to: '/followed-up', label: 'تمت متابعتهم', icon: '✅' },
  { to: '/backup', label: 'النسخ الاحتياطي', icon: '💾' },
  { to: '/change-password', label: 'تغيير كلمة السر', icon: '🔑' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isHome = location.pathname === '/'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-main">METANOIA</span>
          <span className="brand-sub">ميتانويا</span>
        </div>

        <nav className="sidebar-nav">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                'sidebar-link' + (isActive ? ' active' : '')
              }
            >
              <span className="sidebar-icon">{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={logout}>
          <span className="sidebar-icon">🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </aside>

      <div className="main-area">
        <header className="mobile-topbar">
          {!isHome ? (
            <button
              className="mobile-back"
              onClick={() => navigate(-1)}
              aria-label="رجوع"
            >
              →
            </button>
          ) : (
            <span className="mobile-back-placeholder" />
          )}
          <div className="brand">
            <span className="brand-main">METANOIA</span>
            <span className="brand-sub">ميتانويا</span>
          </div>
          <button className="mobile-logout" onClick={logout}>
            خروج
          </button>
        </header>

        <main className="content">{children}</main>

        <nav className="bottom-nav">
          {links.slice(0, 5).map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                'bottom-link' + (isActive ? ' active' : '')
              }
            >
              <span className="bottom-icon">{l.icon}</span>
              <span className="bottom-label">{l.label}</span>
            </NavLink>
          ))}
          <button
            className={'bottom-link' + (moreOpen ? ' active' : '')}
            onClick={() => setMoreOpen(v => !v)}
          >
            <span className="bottom-icon">☰</span>
            <span className="bottom-label">المزيد</span>
          </button>
        </nav>

        {moreOpen && (
          <>
            <div
              className="more-overlay"
              onClick={() => setMoreOpen(false)}
            />
            <div className="more-menu">
              <h4 className="more-title">المزيد</h4>
              {links.slice(5).map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    'more-link' + (isActive ? ' active' : '')
                  }
                  onClick={() => setMoreOpen(false)}
                >
                  <span className="sidebar-icon">{l.icon}</span>
                  <span>{l.label}</span>
                </NavLink>
              ))}
              <button
                className="more-link"
                onClick={() => {
                  setMoreOpen(false)
                  logout()
                }}
              >
                <span className="sidebar-icon">🚪</span>
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}