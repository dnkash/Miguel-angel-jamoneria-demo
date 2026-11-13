'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ESTADO_LABEL, type EstadoPedido } from '@/data/company'

const SIGUIENTES: Record<string, EstadoPedido[]> = {
  pagado: ['preparando', 'cancelado'],
  preparando: ['listo', 'cancelado'],
  listo: ['enviado', 'entregado', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
}

export function StatusActions({ pedidoId, estado }: { pedidoId: number; estado: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')

  const cambiar = async (nuevo: EstadoPedido) => {
    if (nuevo === 'cancelado' && !window.confirm('¿Cancelar este pedido?')) return
    setError('')
    setLoading(nuevo)
    try {
      const response = await fetch(`/api/admin/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevo }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'No se pudo actualizar')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      setLoading('')
    }
  }

  const opciones = SIGUIENTES[estado] ?? []

  return (
    <div className="status-actions">
      {opciones.length === 0 && <p className="admin-muted">Este pedido no tiene más acciones.</p>}
      {opciones.map((opcion) => (
        <button
          key={opcion}
          type="button"
          className={`btn btn--sm ${opcion === 'cancelado' ? 'btn--ghost' : 'btn--gold'}`}
          onClick={() => cambiar(opcion)}
          disabled={Boolean(loading)}
        >
          <span>{loading === opcion ? 'Guardando…' : ESTADO_LABEL[opcion]}</span>
        </button>
      ))}
      {error && <p className="checkout__error">{error}</p>}
    </div>
  )
}
