import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-auth'
import {
  getActividadReciente,
  getResumen,
  getStockBajo,
  getTopProductos,
  getVentasSemana,
} from '@/lib/admin-data'
import { ESTADO_LABEL, type EstadoPedido } from '@/data/company'
import { euros, fechaCorta } from '@/lib/format'
import { ResetButton } from './reset-button'

export const dynamic = 'force-dynamic'

function accionTexto(accion: string, detalle: string | null) {
  if (accion === 'cambio_estado') return `cambió el estado: ${detalle ?? ''}`
  if (accion === 'nota_interna') return 'actualizó una nota interna'
  if (accion === 'reset_demo') return `reseteó la demo (${detalle ?? 'sin detalle'})`
  if (accion === 'ajuste_stock') return `ajustó stock: ${detalle ?? ''}`
  return accion
}

export default async function AdminHome() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  let resumen
  let actividad
  let stockBajo
  let topProductos
  let semana

  try {
    ;[resumen, actividad, stockBajo, topProductos, semana] = await Promise.all([
      getResumen(),
      getActividadReciente(8),
      getStockBajo(6),
      getTopProductos(5),
      getVentasSemana(),
    ])
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
        {session.rol === 'encargado' ? (
          <ResetButton />
        ) : (
          <span className="admin-muted">Reset solo para encargado</span>
        )}
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

      <section className="admin-card admin-chart">
        <div className="admin-chart__head">
          <h2>Ventas últimos 7 días</h2>
          <span>{euros(semana.total)} · {semana.pedidos} pedidos</span>
        </div>
        <div className="chart" role="img" aria-label="Ventas de los últimos siete días">
          {semana.dias.map((dia) => {
            const max = Math.max(1, ...semana.dias.map((d) => d.total))
            return (
              <div className="chart__col" key={dia.fecha}>
                <div className="chart__track">
                  <div
                    className={`chart__bar ${dia.total === 0 ? 'is-empty' : ''}`}
                    style={{ height: `${dia.total === 0 ? 3 : Math.max(6, (dia.total / max) * 100)}%` }}
                    title={`${dia.label}: ${euros(dia.total)} · ${dia.pedidos} pedidos`}
                  />
                </div>
                <small>{dia.label}</small>
              </div>
            )
          })}
        </div>
      </section>

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

      <div className="admin__grid">
        <section className="admin-card">
          <h2>Stock bajo</h2>
          {stockBajo.length === 0 ? (
            <p className="admin-muted">Todo el catálogo está por encima de 10 unidades.</p>
          ) : (
            <ul className="admin-lista">
              {stockBajo.map((producto) => (
                <li key={producto.slug}>
                  <span>{producto.nombre}</span>
                  <b className={(producto.stock ?? 0) <= 5 ? 'is-low' : ''}>{producto.stock ?? 0} uds</b>
                </li>
              ))}
            </ul>
          )}
          <p className="admin-muted">Aviso visual para reponer antes de quedarte sin stock.</p>
        </section>

        <section className="admin-card">
          <h2>Más vendidos</h2>
          {topProductos.length === 0 ? (
            <p className="admin-muted">Todavía no hay ventas registradas.</p>
          ) : (
            <ul className="admin-lista">
              {topProductos.map((producto, index) => (
                <li key={producto.nombre}>
                  <span><i>{index + 1}.</i> {producto.nombre}</span>
                  <b>{producto.unidades} uds</b>
                </li>
              ))}
            </ul>
          )}
          <p className="admin-muted">Calculado sobre pedidos no cancelados.</p>
        </section>
      </div>

      <section className="admin-card admin-activity">
        <h2>Actividad reciente</h2>
        {actividad.length === 0 ? (
          <p className="admin-muted">Todavía no hay acciones registradas.</p>
        ) : (
          <ul>
            {actividad.map((registro) => (
              <li key={registro.id}>
                <span className={`role-badge role-badge--${registro.rol}`}>{registro.usuario}</span>
                <p>
                  {accionTexto(registro.accion, registro.detalle)}
                  {registro.numero && (
                    <> · <Link href={`/admin/pedidos/${registro.pedidoId}`}>{registro.numero}</Link></>
                  )}
                </p>
                <time>{fechaCorta(registro.creadoEn)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
