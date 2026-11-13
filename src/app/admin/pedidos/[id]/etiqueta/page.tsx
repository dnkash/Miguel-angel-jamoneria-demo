import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import QRCode from 'qrcode'
import { getAdminSession } from '@/lib/admin-auth'
import { getPedido } from '@/lib/admin-data'
import { COMPANY } from '@/data/company'
import { fechaCorta, euros } from '@/lib/format'
import { EtiquetaPrintButton } from './print-button'

export const dynamic = 'force-dynamic'

export default async function EtiquetaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (!(await getAdminSession())) redirect('/admin/login')

  const { id } = await params
  const pedidoId = Number(id)
  if (!Number.isInteger(pedidoId)) notFound()

  const data = await getPedido(pedidoId)
  if (!data) notFound()
  const { pedido } = data

  const cabeceras = await headers()
  const host = cabeceras.get('x-forwarded-host') ?? cabeceras.get('host') ?? 'localhost:3001'
  const proto = cabeceras.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  const url = `${proto}://${host}/pedido/${pedido.token}`
  const qr = await QRCode.toDataURL(url, {
    margin: 1,
    width: 280,
    errorCorrectionLevel: 'M',
    color: { dark: '#111111', light: '#ffffff' },
  })

  const esRecogida = pedido.entregaTipo === 'recogida'

  return (
    <div className="etiqueta-page">
      <div className="etiqueta">
        <div className="etiqueta__brand">
          Miguel Ángel Jamonería
          <small>Demo · sin validez fiscal</small>
        </div>

        <div className="etiqueta__tipo">{esRecogida ? 'Recogida en tienda' : 'Envío a domicilio'}</div>
        <div className="etiqueta__numero">{pedido.numero}</div>

        <div className="etiqueta__grid">
          <div>
            <h3>{esRecogida ? 'Recoger en' : 'Destinatario'}</h3>
            <p>
              <b>{esRecogida ? COMPANY.nombre : pedido.clienteNombre}</b><br />
              {esRecogida ? COMPANY.direccion : pedido.direccion}<br />
              {esRecogida ? `${COMPANY.codigoPostal} ${COMPANY.ciudad}` : `${pedido.codigoPostal} ${pedido.ciudad}`}
            </p>

            <h3>Contacto</h3>
            <p>
              {pedido.clienteTelefono || 'Sin teléfono'}<br />
              {pedido.clienteEmail}
            </p>

            <h3>Pedido</h3>
            <p>
              {fechaCorta(pedido.creadoEn)}<br />
              {euros(pedido.totalCent)}
            </p>
          </div>

          <div className="etiqueta__qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={`QR de seguimiento de ${pedido.numero}`} />
            <small>Escanear para seguir el pedido</small>
          </div>
        </div>

        <div className="etiqueta__pie">
          {url}
        </div>
      </div>

      <div className="etiqueta-page__actions">
        <EtiquetaPrintButton />
        <Link href={`/admin/pedidos/${pedido.id}`} className="btn btn--ghost btn--sm">
          <span>Volver al pedido</span>
        </Link>
      </div>
    </div>
  )
}
