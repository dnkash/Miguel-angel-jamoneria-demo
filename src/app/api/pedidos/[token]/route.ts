import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { demoPedidoLineas, demoPedidos } from '@/db/schema'
import { ESTADOS } from '@/data/company'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 503 })
  }

  try {
    const [pedido] = await db.select().from(demoPedidos).where(eq(demoPedidos.token, token))
    if (!pedido) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const lineas = await db
      .select()
      .from(demoPedidoLineas)
      .where(eq(demoPedidoLineas.pedidoId, pedido.id))

    const pasos = ESTADOS.map((estado) => {
      const fechas: Record<string, Date | null> = {
        pagado: pedido.creadoEn,
        preparando: pedido.preparadoEn,
        listo: pedido.listoEn,
        enviado: pedido.enviadoEn,
        entregado: pedido.entregadoEn,
      }
      return {
        id: estado.id,
        label: estado.label,
        descripcion: estado.descripcion,
        fecha: fechas[estado.id] ?? null,
        completado: Boolean(fechas[estado.id]),
      }
    })

    return NextResponse.json({
      numero: pedido.numero,
      estado: pedido.estado,
      creadoEn: pedido.creadoEn,
      entregaTipo: pedido.entregaTipo,
      direccion: pedido.direccion,
      ciudad: pedido.ciudad,
      codigoPostal: pedido.codigoPostal,
      subtotalCent: pedido.subtotalCent,
      envioCent: pedido.envioCent,
      totalCent: pedido.totalCent,
      clienteNombre: pedido.clienteNombre,
      lineas: lineas.map((l) => ({
        slug: l.productoSlug,
        nombre: l.nombre,
        precioCent: l.precioCent,
        cantidad: l.cantidad,
        subtotalCent: l.subtotalCent,
      })),
      pasos,
    })
  } catch (error) {
    console.error('[pedidos] Error consultando pedido:', error)
    return NextResponse.json({ error: 'No se pudo consultar el pedido' }, { status: 500 })
  }
}
