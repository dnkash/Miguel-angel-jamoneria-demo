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

  const criticos = filas.filter((p) => (p.stock ?? 0) <= 10).length
  const bajos = filas.filter((p) => {
    const stock = p.stock ?? 0
    return stock > 10 && stock <= 20
  }).length

  const nivel = (stock: number) => {
    if (stock <= 10) return 'is-critical'
    if (stock <= 20) return 'is-warning'
    return ''
  }

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
      setFilas((prev) =>
        [...prev].sort(
          (a, b) => (a.stock ?? 0) - (b.stock ?? 0) || a.nombre.localeCompare(b.nombre)
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setGuardando('')
    }
  }

  return (
    <div className="stock">
      <div className="stock__resumen">
        <span className="is-critical">{criticos} en crítico (≤10)</span>
        <span className="is-warning">{bajos} bajo stock (11–20)</span>
        <span>{filas.length} productos</span>
      </div>

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
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibles.map((producto) => {
              const stock = producto.stock ?? 0
              const estado = nivel(stock)
              return (
                <tr key={producto.slug} className={estado}>
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
                      className={estado}
                      aria-label={`Stock de ${producto.nombre}`}
                    />
                  </td>
                  <td>
                    <span className={`stock__badge ${estado}`}>
                      {estado === 'is-critical' ? 'Crítico' : estado === 'is-warning' ? 'Bajo' : 'OK'}
                    </span>
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
