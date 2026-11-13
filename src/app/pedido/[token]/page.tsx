import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { demoPedidoLineas, demoPedidos } from '@/db/schema'
import { COMPANY, ESTADOS, ESTADO_LABEL, type EstadoPedido } from '@/data/company'

export const dynamic = 'force-dynamic'

function euros(cent: number) {
  return `${(cent / 100).toFixed(2).replace('.', ',')} €`
}

function fecha(value: Date | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(value)
}

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ nuevo?: string }>
}) {
  const { token } = await params
  const { nuevo } = await searchParams

  if (!process.env.DATABASE_URL) notFound()

  let pedido: typeof demoPedidos.$inferSelect | undefined
  let lineas: (typeof demoPedidoLineas.$inferSelect)[] = []

  try {
    ;[pedido] = await db.select().from(demoPedidos).where(eq(demoPedidos.token, token))
    if (pedido) {
      lineas = await db
        .select()
        .from(demoPedidoLineas)
        .where(eq(demoPedidoLineas.pedidoId, pedido.id))
    }
  } catch (error) {
    console.error('[pedido] Error cargando pedido:', error)
    notFound()
  }

  if (!pedido) notFound()

  const estado = pedido.estado as EstadoPedido
  const fechas: Record<string, Date | null> = {
    pagado: pedido.creadoEn,
    preparando: pedido.preparadoEn,
    listo: pedido.listoEn,
    enviado: pedido.enviadoEn,
    entregado: pedido.entregadoEn,
  }
  const indiceActual = ESTADOS.findIndex((e) => e.id === estado)

  return (
    <div className="tracking">
      {nuevo === '1' && (
        <div className="tracking__ok">
          <p className="eyebrow">Pedido confirmado</p>
          <h1>Gracias, {pedido.clienteNombre.split(' ')[0]}.</h1>
          <p>Hemos recibido tu pedido y ya estamos preparando la selección.</p>
        </div>
      )}

      <div className="tracking__head">
        <div>
          <p className="eyebrow">Pedido {pedido.numero}</p>
          <h1>{ESTADO_LABEL[estado]}</h1>
          <p className="tracking__meta">
            {fecha(pedido.creadoEn)} · {pedido.entregaTipo === 'recogida' ? 'Recogida en el mercado' : 'Envío a domicilio'}
          </p>
        </div>
        <span className={`tracking__badge tracking__badge--${estado}`}>{ESTADO_LABEL[estado]}</span>
      </div>

      {estado !== 'cancelado' && (
        <ol className="timeline">
          {ESTADOS.map((paso, index) => {
            const completado = Boolean(fechas[paso.id])
            const actual = index === indiceActual
            return (
              <li key={paso.id} className={`${completado ? 'is-done' : ''} ${actual ? 'is-current' : ''}`}>
                <span className="timeline__dot" />
                <div>
                  <h3>{paso.label}</h3>
                  <p>{paso.descripcion}</p>
                  {fechas[paso.id] && <time>{fecha(fechas[paso.id])}</time>}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <div className="tracking__grid">
        <section className="tracking__card">
          <h2>Tu selección</h2>
          {lineas.map((linea) => (
            <div className="checkout__line" key={linea.id}>
              <span>{linea.cantidad} × {linea.nombre}</span>
              <b>{euros(linea.subtotalCent)}</b>
            </div>
          ))}
          <div className="checkout__line"><span>Subtotal</span><b>{euros(pedido.subtotalCent)}</b></div>
          <div className="checkout__line"><span>Envío</span><b>{pedido.envioCent === 0 ? 'Gratis' : euros(pedido.envioCent)}</b></div>
          <div className="checkout__total"><span>Total</span><b>{euros(pedido.totalCent)}</b></div>
        </section>

        <section className="tracking__card">
          <h2>Entrega</h2>
          {pedido.entregaTipo === 'recogida' ? (
            <p>
              <b>{COMPANY.direccion}</b><br />
              {COMPANY.codigoPostal} {COMPANY.ciudad}<br />
              {COMPANY.horario}
            </p>
          ) : (
            <p>
              <b>{pedido.clienteNombre}</b><br />
              {pedido.direccion}<br />
              {pedido.codigoPostal} {pedido.ciudad}
            </p>
          )}
          {pedido.notas && (
            <>
              <h3>Notas</h3>
              <p>{pedido.notas}</p>
            </>
          )}
          <p className="tracking__demo">Pago simulado · demo sin validez fiscal.</p>
        </section>
      </div>

      <div className="tracking__actions">
        <Link href="/#productos" className="btn btn--gold btn--sm"><span>Seguir comprando</span></Link>
        <Link href="/" className="btn btn--ghost btn--sm"><span>Volver al inicio</span></Link>
      </div>
    </div>
  )
}
