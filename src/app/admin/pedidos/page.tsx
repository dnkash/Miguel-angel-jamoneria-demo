import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { getPedidos } from '@/lib/admin-data'
import { ESTADOS, ESTADO_LABEL, type EstadoPedido } from '@/data/company'
import { euros, fechaCorta } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>
}) {
  if (!(await isAdmin())) redirect('/admin/login')

  const { estado = 'todos', q = '' } = await searchParams

  let pedidos
  try {
    pedidos = await getPedidos({ estado, q })
  } catch (error) {
    console.error('[admin] Error listando pedidos:', error)
    return (
      <div className="admin__content">
        <h1>Pedidos</h1>
        <p className="admin-muted">No se pudo conectar con la base de datos.</p>
      </div>
    )
  }

  return (
    <div className="admin__content">
      <div className="admin__head">
        <div>
          <p className="eyebrow">Operación</p>
          <h1>Pedidos</h1>
        </div>
        <span className="admin-muted">{pedidos.length} resultados</span>
      </div>

      <form className="admin-filtros" method="get">
        <label>
          Estado
          <select name="estado" defaultValue={estado}>
            <option value="todos">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
            <option value="cancelado">Cancelado</option>
          </select>
        </label>
        <label>
          Buscar
          <input name="q" defaultValue={q} placeholder="Número, nombre o email" />
        </label>
        <button type="submit" className="btn btn--outline btn--sm"><span>Filtrar</span></button>
        <Link href="/admin/pedidos" className="admin__link">Limpiar</Link>
      </form>

      {pedidos.length === 0 ? (
        <p className="admin-muted">No hay pedidos con esos filtros.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Entrega</th>
                <th>Total</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td><b>{pedido.numero}</b></td>
                  <td>{fechaCorta(pedido.creadoEn)}</td>
                  <td>{pedido.clienteNombre}<small>{pedido.clienteEmail}</small></td>
                  <td>{pedido.entregaTipo === 'recogida' ? 'Recogida' : 'Envío'}</td>
                  <td>{euros(pedido.totalCent)}</td>
                  <td><span className={`badge badge--${pedido.estado}`}>{ESTADO_LABEL[pedido.estado as EstadoPedido] ?? pedido.estado}</span></td>
                  <td><Link href={`/admin/pedidos/${pedido.id}`} className="admin__link">Abrir →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
