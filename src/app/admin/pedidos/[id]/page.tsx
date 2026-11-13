import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-auth'
import { getAuditoriaPedido, getPedido } from '@/lib/admin-data'
import { COMPANY, ESTADO_LABEL, type EstadoPedido } from '@/data/company'
import { euros, fechaCorta } from '@/lib/format'
import { StatusActions } from './status-actions'
import { NoteForm } from './note-form'
import { PrintButton } from './print-button'

export const dynamic = 'force-dynamic'

export default async function PedidoAdminPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { id } = await params
  const pedidoId = Number(id)
  if (!Number.isInteger(pedidoId)) notFound()

  let data
  let auditoria: Awaited<ReturnType<typeof getAuditoriaPedido>> = []
  try {
    ;[data, auditoria] = await Promise.all([getPedido(pedidoId), getAuditoriaPedido(pedidoId)])
  } catch (error) {
    console.error('[admin] Error cargando pedido:', error)
    return (
      <div className="admin__content">
        <h1>Pedido</h1>
        <p className="admin-muted">No se pudo conectar con la base de datos.</p>
      </div>
    )
  }

  if (!data) notFound()
  const { pedido, lineas, mensajes } = data
  const estado = pedido.estado as EstadoPedido

  return (
    <div className="admin__content admin-pedido">
      <div className="admin__head">
        <div>
          <Link href="/admin/pedidos" className="admin__link">← Pedidos</Link>
          <h1>{pedido.numero}</h1>
          <p className="admin-muted">{fechaCorta(pedido.creadoEn)} · {pedido.entregaTipo === 'recogida' ? 'Recogida en el mercado' : 'Envío a domicilio'}</p>
        </div>
        <div className="admin__head-actions">
          <span className={`badge badge--${pedido.estado}`}>{ESTADO_LABEL[estado] ?? pedido.estado}</span>
          <PrintButton />
        </div>
      </div>

      <div className="admin-card admin-acciones">
        <h2>Cambiar estado</h2>
        <StatusActions pedidoId={pedido.id} estado={pedido.estado} rol={session.rol} />
      </div>

      <div className="admin__grid admin__grid--pedido">
        <section className="admin-card">
          <h2>Selección</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {lineas.map((linea) => (
                <tr key={linea.id}>
                  <td>{linea.nombre}<small>{linea.productoSlug}</small></td>
                  <td>{linea.cantidad}</td>
                  <td>{euros(linea.precioCent)}</td>
                  <td>{euros(linea.subtotalCent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-totales">
            <div><span>Subtotal</span><b>{euros(pedido.subtotalCent)}</b></div>
            <div><span>Envío</span><b>{pedido.envioCent === 0 ? 'Gratis' : euros(pedido.envioCent)}</b></div>
            <div className="admin-totales__total"><span>Total</span><b>{euros(pedido.totalCent)}</b></div>
          </div>
        </section>

        <div className="admin__stack">
          <section className="admin-card">
            <h2>Cliente</h2>
            <p><b>{pedido.clienteNombre}</b><br />{pedido.clienteEmail}<br />{pedido.clienteTelefono || 'Sin teléfono'}</p>
            <h3>Entrega</h3>
            {pedido.entregaTipo === 'recogida' ? (
              <p>{COMPANY.direccion}<br />{COMPANY.codigoPostal} {COMPANY.ciudad}<br />{COMPANY.horario}</p>
            ) : (
              <p>{pedido.direccion}<br />{pedido.codigoPostal} {pedido.ciudad}</p>
            )}
            {pedido.notas && (
              <>
                <h3>Notas del cliente</h3>
                <p>{pedido.notas}</p>
              </>
            )}
            <h3>Pago</h3>
            <p>{pedido.pagoMetodo} · {pedido.pagoEstado}<br /><small>Simulado, sin cobro real.</small></p>
          </section>

          <section className="admin-card admin-card--note">
            <h2>Nota interna</h2>
            <NoteForm pedidoId={pedido.id} nota={pedido.notaInterna} />
          </section>
        </div>
      </div>

      <section className="admin-card">
        <h2>Mensajes simulados</h2>
        {mensajes.length === 0 ? (
          <p className="admin-muted">Todavía no se ha generado ningún mensaje.</p>
        ) : (
          <ul className="admin-mensajes">
            {mensajes.map((mensaje) => (
              <li key={mensaje.id}>
                <div>
                  <b>{mensaje.asunto}</b>
                  <small>{fechaCorta(mensaje.creadoEn)} · {mensaje.destinatario}</small>
                </div>
                <pre>{mensaje.cuerpo}</pre>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="admin-card">
        <h2>Historial de cambios</h2>
        {auditoria.length === 0 ? (
          <p className="admin-muted">Todavía no hay cambios registrados.</p>
        ) : (
          <ul className="admin-timeline">
            {auditoria.map((registro) => (
              <li key={registro.id}>
                <span className={`role-badge role-badge--${registro.rol}`}>{registro.usuario}</span>
                <p>
                  {registro.accion === 'cambio_estado' && `Cambio de estado: ${registro.detalle}`}
                  {registro.accion === 'nota_interna' && 'Nota interna actualizada'}
                  {registro.accion === 'reset_demo' && `Reset de demo: ${registro.detalle}`}
                  {!['cambio_estado', 'nota_interna', 'reset_demo'].includes(registro.accion) && registro.accion}
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
