'use client'

import { useMemo, useState } from 'react'
import { euros } from '@/lib/format'

type Producto = {
  id: number
  slug: string
  nombre: string
  precioCent: number
  stock: number | null
}

export function StockTable({ productos }: { productos: Producto[] }) {
  const [filas, setFilas] = useState(productos)
  const [filtro, setFiltro] = useState('')
  const [guardando, setGuardando] = useState('')
  const [guardado, setGuardado] = useState('')
  const [error, setError] = useState('')

  const visibles = useMemo(() => {
    const q = filtro.trim().toLowerCase()
    if (!q) return filas
    return filas.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    )
  }, [filas, filtro])

  const cambiar = (slug: string, valor: string) => {
    const stock = valor === '' ? 0 : Number(valor)
    setFilas((prev) => prev.map((p) => (p.slug === slug ? { ...p, stock } : p)))
    setGuardado('')
  }

  const guardar = async (producto: Producto) => {
    setError('')
    setGuardado('')
    setGuardando(producto.slug)
    try {
      const response = await fetch(`/api/admin/productos/${encodeURIComponent(producto.slug)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: producto.stock ?? 0 }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar')
      setGuardado(producto.slug)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setGuardando('')
    }
  }

  return (
    <div className="stock">
      <div className="stock__filtro">
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar producto o slug…"
          aria-label="Buscar producto"
        />
      </div>

      {error && <p className="checkout__error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table stock__table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibles.map((producto) => {
              const stock = producto.stock ?? 0
              return (
                <tr key={producto.slug}>
                  <td>
                    {producto.nombre}
                    <small>{producto.slug}</small>
                  </td>
                  <td>{euros(producto.precioCent)}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={99999}
                      value={stock}
                      onChange={(e) => cambiar(producto.slug, e.target.value)}
                      className={stock <= 5 ? 'is-low' : stock <= 10 ? 'is-warn' : ''}
                      aria-label={`Stock de ${producto.nombre}`}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => guardar(producto)}
                      disabled={guardando === producto.slug}
                    >
                      <span>{guardando === producto.slug ? 'Guardando…' : 'Guardar'}</span>
                    </button>
                    {guardado === producto.slug && <span className="admin-ok">Guardado</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {visibles.length === 0 && <p className="admin-muted">No hay productos con ese filtro.</p>}
    </div>
  )
}
