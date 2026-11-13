import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { getMensajes } from '@/lib/admin-data'
import { fechaCorta } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function MensajesPage() {
  if (!(await isAdmin())) redirect('/admin/login')

  let mensajes
  try {
    mensajes = await getMensajes()
  } catch (error) {
    console.error('[admin] Error cargando mensajes:', error)
    return (
      <div className="admin__content">
        <h1>Mensajes</h1>
        <p className="admin-muted">No se pudo conectar con la base de datos.</p>
      </div>
    )
  }

  return (
    <div className="admin__content">
      <div className="admin__head">
        <div>
          <p className="eyebrow">Bandeja simulada</p>
          <h1>Mensajes</h1>
        </div>
        <span className="admin-muted">{mensajes.length} mensajes</span>
      </div>

      <p className="admin-muted">
        Estos emails se generan al cambiar el estado de un pedido. No se envían de verdad:
        quedan guardados aquí para la demo.
      </p>

      {mensajes.length === 0 ? (
        <p className="admin-muted">No hay mensajes todavía. Cambia el estado de un pedido para generarlos.</p>
      ) : (
        <ul className="admin-bandeja">
          {mensajes.map((mensaje) => (
            <li key={mensaje.id}>
              <details>
                <summary>
                  <span>
                    <b>{mensaje.asunto}</b>
                    <small>{mensaje.destinatario} · {fechaCorta(mensaje.creadoEn)}</small>
                  </span>
                  {mensaje.pedidoId && (
                    <Link href={`/admin/pedidos/${mensaje.pedidoId}`} className="admin__link">
                      {mensaje.numero} →
                    </Link>
                  )}
                </summary>
                <pre>{mensaje.cuerpo}</pre>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
