'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NoteForm({ pedidoId, nota }: { pedidoId: number; nota: string | null }) {
  const router = useRouter()
  const [valor, setValor] = useState(nota ?? '')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)

  const guardar = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setOk(false)
    try {
      const response = await fetch(`/api/admin/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notaInterna: valor }),
      })
      if (!response.ok) throw new Error('No se pudo guardar')
      setOk(true)
      router.refresh()
    } catch {
      setOk(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="admin-note" onSubmit={guardar}>
      <label htmlFor="nota">Nota interna</label>
      <textarea
        id="nota"
        rows={3}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Sin lonchear, regalo, avisar por teléfono…"
      />
      <button type="submit" className="btn btn--outline btn--sm" disabled={loading}>
        <span>{loading ? 'Guardando…' : 'Guardar nota'}</span>
      </button>
      {ok && <span className="admin-ok">Guardada</span>}
    </form>
  )
}
