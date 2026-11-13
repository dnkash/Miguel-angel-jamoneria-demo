import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { getResumen } from '@/lib/admin-data'
import { ESTADO_LABEL, type EstadoPedido } from '@/data/company'
import { euros, fechaCorta } from '@/lib/format'
import { ResetButton } from './reset-button'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  if (!(await isAdmin())) redirect('/admin/login')

  let resumen
  try {
    resumen = await getResumen()
  } catch (error) {
    console.error('[admin] Error cargando resumen:', error)
    return (
      <div className="admin__content">
        <h1>Resumen</h1>
        <p className="admin-muted">No se pudo conectar con la base de datos.</p>
      </div>
    )
  }

  return (
    <div className="admin__content">
      <div className="admin__head">
        <div>
          <p className="eyebrow">Vista general</p>
          <h1>Resumen</h1>
        </div>
        <ResetButton />
      </div>

      <div className="admin__stats">
        <article className="admin-stat">
          <span>Pedidos hoy</span>
          <b>{resumen.hoy}</b>
        </article>
        <article className="admin-stat">
          <span>Pendientes</span>
          <b>{resumen.pendientes}</b>
        </article>
        <article className="admin-stat">
          <span>Ventas hoy</span>
          <b>{euros(resumen.ventasHoy)}</b>
        </article>
        <article className="admin-stat">
          <span>Ticket medio</span>
          <b>{euros(resumen.ticketMedio)}</b>
        </article>
      </div>

      <div className="admin__grid">
        <section className="admin-card">
          <h2>Últimos pedidos</h2>
          {resumen.ultimos.length === 0 ? (
            <p className="admin-muted">Todavía no hay pedidos. Crea uno desde la tienda.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {resumen.ultimos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td><Link href={`/admin/pedidos/${pedido.id}`}>{pedido.numero}</Link><small>{fechaCorta(pedido.creadoEn)}</small></td>
                    <td>{pedido.clienteNombre}</td>
                    <td>{euros(pedido.totalCent)}</td>
                    <td><span className={`badge badge--${pedido.estado}`}>{ESTADO_LABEL[pedido.estado as EstadoPedido] ?? pedido.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Link href="/admin/pedidos" className="admin__more">Ver todos los pedidos →</Link>
        </section>

        <section className="admin-card">
          <h2>Por estado</h2>
          <ul className="admin-estados">
            {resumen.porEstado.length === 0 && <li className="admin-muted">Sin pedidos.</li>}
            {resumen.porEstado.map((fila) => (
              <li key={fila.estado}>
                <span className={`badge badge--${fila.estado}`}>{ESTADO_LABEL[fila.estado as EstadoPedido] ?? fila.estado}</span>
                <b>{fila.n}</b>
              </li>
            ))}
          </ul>
          <p className="admin-muted">Total histórico: {resumen.total} pedidos · {euros(resumen.ventasTotal)}</p>
        </section>
      </div>
    </div>
  )
}
