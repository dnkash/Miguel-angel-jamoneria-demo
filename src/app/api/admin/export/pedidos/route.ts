import { getAdminSession } from '@/lib/admin-auth'
import { getPedidos } from '@/lib/admin-data'
import { ESTADO_LABEL, type EstadoPedido } from '@/data/company'
import { fechaCorta } from '@/lib/format'

export const dynamic = 'force-dynamic'

function celda(valor: string | number | null | undefined) {
  const texto = String(valor ?? '').replace(/\r?\n/g, ' ').replace(/"/g, '""')
  return `"${texto}"`
}

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return new Response('No autorizado', { status: 401 })
  }

  const url = new URL(request.url)
  const estado = url.searchParams.get('estado') ?? 'todos'
  const q = url.searchParams.get('q') ?? ''
  const pedidos = await getPedidos({ estado, q })

  const cabeceras = [
    'Numero',
    'Fecha',
    'Cliente',
    'Email',
    'Telefono',
    'Entrega',
    'Direccion',
    'Ciudad',
    'CP',
    'Subtotal',
    'Envio',
    'Total',
    'Estado',
    'Pago',
    'Notas',
  ]

  const filas = pedidos.map((pedido) =>
    [
      pedido.numero,
      fechaCorta(pedido.creadoEn),
      pedido.clienteNombre,
      pedido.clienteEmail,
      pedido.clienteTelefono,
      pedido.entregaTipo === 'recogida' ? 'Recogida' : 'Envio',
      pedido.direccion,
      pedido.ciudad,
      pedido.codigoPostal,
      (pedido.subtotalCent / 100).toFixed(2),
      (pedido.envioCent / 100).toFixed(2),
      (pedido.totalCent / 100).toFixed(2),
      ESTADO_LABEL[pedido.estado as EstadoPedido] ?? pedido.estado,
      `${pedido.pagoMetodo} / ${pedido.pagoEstado}`,
      pedido.notas,
    ]
      .map(celda)
      .join(';')
  )

  const csv = `\uFEFF${cabeceras.map(celda).join(';')}\r\n${filas.join('\r\n')}\r\n`
  const fecha = new Date().toISOString().slice(0, 10)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pedidos-${fecha}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
