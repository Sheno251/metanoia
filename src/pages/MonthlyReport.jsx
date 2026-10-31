import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatDateAr } from '../lib/dates'
import { ageFromBirthDate } from '../lib/stages'

export default function MonthlyReport() {
  const [loading, setLoading] = useState(true)
  const [confessions, setConfessions] = useState([])
  const [people, setPeople] = useState([])
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)
  const reportRef = useRef(null)

  useEffect(() => {
    load()
  }, [month])

  async function load() {
    setLoading(true)
    setError(null)

    const [year, m] = month.split('-').map(Number)
    const start = `${year}-${String(m).padStart(2, '0')}-01`
    const lastDay = new Date(year, m, 0).getDate()
    const end = `${year}-${String(m).padStart(2, '0')}-${lastDay}`

    const [confRes, peopleRes] = await Promise.all([
      supabase
        .from('confessions')
        .select('id, confession_date, people(name)')
        .gte('confession_date', start)
        .lte('confession_date', end)
        .order('confession_date', { ascending: true }),
      supabase.from('people').select('*'),
    ])

    if (confRes.error) setError(confRes.error.message)
    else setConfessions(confRes.data || [])

    if (!peopleRes.error) setPeople(peopleRes.data || [])

    setLoading(false)
  }

  const summary = useMemo(() => {
    const count = confessions.length
    const unique = new Set(confessions.map(c => c.people?.name)).size
    return { count, unique }
  }, [confessions])

  const groupedByDate = useMemo(() => {
    const g = {}
    confessions.forEach(c => {
      const d = c.confession_date
      if (!g[d]) g[d] = []
      g[d].push(c)
    })
    return g
  }, [confessions])

  const peopleStats = useMemo(() => {
    const map = new Map()
    people.forEach(p => map.set(p.id, { person: p, confessions: 0, lastDate: null }))
    confessions.forEach(c => {
      const person = people.find(p => p.name === c.people?.name)
      if (!person) return
      const entry = map.get(person.id)
      if (!entry) return
      entry.confessions++
      if (!entry.lastDate || c.confession_date > entry.lastDate) {
        entry.lastDate = c.confession_date
      }
    })
    return Array.from(map.values())
      .filter(e => e.confessions > 0)
      .sort((a, b) => b.confessions - a.confessions)
  }, [people, confessions])

  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1, 1)
    return d.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
  }, [month])

  async function exportPDF() {
    if (!reportRef.current) return
    setExporting(true)
    setError(null)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#fbf8f1',
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgW = pageW
      const imgH = (canvas.height * imgW) / canvas.width

      let heightLeft = imgH
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
      heightLeft -= pageH

      while (heightLeft > 0) {
        position = heightLeft - imgH
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
        heightLeft -= pageH
      }

      pdf.save(`metanoia-report-${month}.pdf`)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">التقرير الشهري</h1>
        <div className="row-actions">
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="month-input"
          />
          <button
            className="btn btn-primary"
            onClick={exportPDF}
            disabled={exporting || loading || confessions.length === 0}
          >
            {exporting ? 'جاري التصدير…' : 'تصدير PDF'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">جاري التحميل…</div>
      ) : confessions.length === 0 ? (
        <p className="muted">مفيش اعترافات في الشهر ده.</p>
      ) : (
        <div ref={reportRef} className="report-paper">
          <header className="report-header">
            <div className="report-brand">METANOIA – ميتانويا</div>
            <div className="report-title">تقرير الاعترافات الشهري</div>
            <div className="report-month">{monthLabel}</div>
          </header>

          <section className="report-stats">
            <div className="report-stat">
              <div className="report-stat-value">{summary.count}</div>
              <div className="report-stat-label">إجمالي الاعترافات</div>
            </div>
            <div className="report-stat">
              <div className="report-stat-value">{summary.unique}</div>
              <div className="report-stat-label">أشخاص مختلفين</div>
            </div>
          </section>

          <section className="report-section">
            <h3 className="report-section-title">تفاصيل حسب اليوم</h3>
            {Object.entries(groupedByDate).map(([date, list]) => (
              <div key={date} className="report-day">
                <div className="report-day-head">
                  <strong>{formatDateAr(date)}</strong>
                  <span className="muted">({list.length})</span>
                </div>
                <ul className="report-names">
                  {list.map(c => (
                    <li key={c.id}>{c.people?.name || '—'}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="report-section">
            <h3 className="report-section-title">عدد الاعترافات لكل شخص</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>السن</th>
                  <th>عدد الاعترافات</th>
                  <th>آخر اعتراف</th>
                </tr>
              </thead>
              <tbody>
                {peopleStats.map(({ person, confessions, lastDate }) => (
                  <tr key={person.id}>
                    <td>{person.name}</td>
                    <td>{ageFromBirthDate(person.birth_date) ?? '—'}</td>
                    <td>{confessions}</td>
                    <td>{formatDateAr(lastDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <footer className="report-footer">
            تم إنشاء التقرير في {formatDateAr(new Date().toISOString().slice(0, 10))}
          </footer>
        </div>
      )}
    </div>
  )
}