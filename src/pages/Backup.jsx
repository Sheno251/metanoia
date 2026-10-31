import { useState } from 'react'
import {
  exportBackupJSON,
  exportBackupCSV,
  importBackupJSON,
} from '../lib/backup'

export default function Backup() {
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)
  const [okMsg, setOkMsg] = useState(null)

  async function doExport(type) {
    setError(null)
    setOkMsg(null)
    setBusy(type)
    try {
      if (type === 'json') await exportBackupJSON()
      else await exportBackupCSV()
      setOkMsg('تم التصدير ✅')
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setBusy(null)
    }
  }

  async function doImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm('الاستيراد هيضيف الأشخاص من الملف. متأكد؟')) {
      e.target.value = ''
      return
    }
    setError(null)
    setOkMsg(null)
    setBusy('import')
    try {
      const count = await importBackupJSON(file)
      setOkMsg(`تم استيراد ${count} شخص ✅`)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setBusy(null)
      e.target.value = ''
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">النسخ الاحتياطي</h1>
      <p className="muted">
        صدّر بياناتك بانتظام عشان متفقدش حاجة. الملفات بتتحفظ على جهازك.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {okMsg && <div className="alert alert-ok">{okMsg}</div>}

      <div className="card">
        <h3 className="section-title">تصدير</h3>
        <div className="row-actions">
          <button
            className="btn btn-primary"
            disabled={!!busy}
            onClick={() => doExport('json')}
          >
            {busy === 'json' ? '…' : 'تنزيل JSON (نسخة كاملة)'}
          </button>
          <button
            className="btn"
            disabled={!!busy}
            onClick={() => doExport('csv')}
          >
            {busy === 'csv' ? '…' : 'تنزيل CSV (يفتح في Excel)'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">استيراد</h3>
        <p className="muted">اختر ملف JSON تم تصديره من الموقع ده.</p>
        <input
          type="file"
          accept="application/json"
          onChange={doImport}
          disabled={!!busy}
        />
      </div>
    </div>
  )
}