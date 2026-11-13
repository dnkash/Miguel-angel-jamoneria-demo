import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-auth'
import { getPedidos } from '@/lib/admin-data'
import { ESTADO_LABEL, type EstadoPedido } from '@/data/company'
import { euros, fechaCorta } from '@/lib/format'
import { InformePrintButton } from './print-button'

export const dynamic = 'force-dynamic'

export default async function InformePage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>
}) {
  if (!(await getAdminSession())) redirect('/admin/login')

  const { estado = 'todos', q = '' } = await searchParams
  const pedidos = await getPedidos({ estado, q })
  const total = pedidos
    .filter((p) => p.estado !== 'cancelado')
    .reduce((suma, p) => suma + p.totalCent, 0)

  return (
    <div className="admin__content informe">
      <div className="admin__head">
        <div>
          <Link href="/admin/pedidos" className="admin__link">← Pedidos</Link>
          <p className="eyebrow">Contabilidad · demo</p>
          <h1>Informe de pedidos</h1>
          <p className="admin-muted">
            {pedidos.length} pedidos · {estado === 'todos' ? 'todos los estados' : ESTADO_LABEL[estado as EstadoPedido] ?? estado}
            {q ? ` · búsqueda: ${q}` : ''}
          </p>
        </div>
        <div className="admin__head-actions">
          <InformePrintButton />
        </div>
      </div>

      <table className="admin-table informe__tabla">
        <thead>
          <tr>
            <th>Número</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Entrega</th>
            <th>Estado</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td><b>{pedido.numero}</b></td>
              <td>{fechaCorta(pedido.creadoEn)}</td>
              <td>{pedido.clienteNombre}<small>{pedido.clienteEmail}</small></td>
              <td>{pedido.entregaTipo === 'recogida' ? 'Recogida' : 'Envío'}</td>
              <td>{ESTADO_LABEL[pedido.estado as EstadoPedido] ?? pedido.estado}</td>
              <td>{euros(pedido.totalCent)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="informe__total">
        <span>Total no cancelado</span>
        <b>{euros(total)}</b>
      </div>

      <p className="informe__nota">
        Documento de demostración. No tiene validez fiscal. Para conservar facturas
        reales, exporta también el CSV y guarda una copia fuera de la base de datos.
      </p>
    </div>
  )
}
