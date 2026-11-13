'use client'

import { useState } from 'react'

export function ResetButton() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const reset = async () => {
    if (!window.confirm('¿Borrar todos los pedidos demo y restaurar el stock?')) return
    setLoading(true)
    setMsg('')
    try {
      const response = await fetch('/api/admin/reset-demo', { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'No se pudo resetear')
      setMsg('Demo reseteada. Recargando…')
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'No se pudo resetear')
      setLoading(false)
    }
  }

  return (
    <div className="admin-reset">
      <button type="button" className="btn btn--ghost btn--sm" onClick={reset} disabled={loading}>
        <span>{loading ? 'Reseteando…' : 'Reset demo'}</span>
      </button>
      {msg && <span className="admin-muted">{msg}</span>}
    </div>
  )
}
