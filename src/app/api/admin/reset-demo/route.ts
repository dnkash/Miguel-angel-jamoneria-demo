import { NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { demoPedidoLineas, demoPedidos, productos } from '@/db/schema'
import { getAdminSession } from '@/lib/admin-auth'
import { registrarAuditoria } from '@/lib/auditoria'

export async function POST() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (session.rol !== 'encargado') {
    return NextResponse.json({ error: 'Solo el encargado puede resetear la demo' }, { status: 403 })
  }

  const lineas = await db
    .select({
      cantidad: demoPedidoLineas.cantidad,
      productoSlug: demoPedidoLineas.productoSlug,
    })
    .from(demoPedidoLineas)
    .innerJoin(demoPedidos, eq(demoPedidoLineas.pedidoId, demoPedidos.id))
    .where(sql`${demoPedidos.estado} <> 'cancelado'`)

  const [antes] = await db.select({ n: sql<number>`count(*)::int` }).from(demoPedidos)

  for (const linea of lineas) {
    await db
      .update(productos)
      .set({ stock: sql`${productos.stock} + ${linea.cantidad}` })
      .where(sql`${productos.slug} = ${linea.productoSlug}`)
  }

  await db.delete(demoPedidos)

  await registrarAuditoria({
    usuario: session.username,
    rol: session.rol,
    accion: 'reset_demo',
    detalle: `${antes?.n ?? 0} pedidos eliminados`,
  })

  return NextResponse.json({
    ok: true,
    pedidosEliminados: antes?.n ?? 0,
    lineasRestauradas: lineas.length,
  })
}
