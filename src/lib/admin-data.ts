import { and, desc, eq, gte, ilike, inArray, or, sql } from 'drizzle-orm'
import { db } from '@/db'
import { demoMensajes, demoPedidoLineas, demoPedidos } from '@/db/schema'

export type Pedido = typeof demoPedidos.$inferSelect
export type LineaPedido = typeof demoPedidoLineas.$inferSelect
export type Mensaje = typeof demoMensajes.$inferSelect

function inicioDelDia() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export async function getResumen() {
  const [total] = await db.select({ n: sql<number>`count(*)::int` }).from(demoPedidos)
  const [pendientes] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(demoPedidos)
    .where(inArray(demoPedidos.estado, ['pagado', 'preparando', 'listo']))
  const [hoy] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(demoPedidos)
    .where(gte(demoPedidos.creadoEn, inicioDelDia()))
  const [ventasHoy] = await db
    .select({ total: sql<number>`coalesce(sum(${demoPedidos.totalCent}), 0)::int` })
    .from(demoPedidos)
    .where(and(gte(demoPedidos.creadoEn, inicioDelDia()), sql`${demoPedidos.estado} <> 'cancelado'`))
  const [ventasTotal] = await db
    .select({
      total: sql<number>`coalesce(sum(${demoPedidos.totalCent}), 0)::int`,
      n: sql<number>`count(*)::int`,
    })
    .from(demoPedidos)
    .where(sql`${demoPedidos.estado} <> 'cancelado'`)

  const porEstado = await db
    .select({ estado: demoPedidos.estado, n: sql<number>`count(*)::int` })
    .from(demoPedidos)
    .groupBy(demoPedidos.estado)

  const ultimos = await db
    .select()
    .from(demoPedidos)
    .orderBy(desc(demoPedidos.creadoEn))
    .limit(5)

  return {
    total: total?.n ?? 0,
    pendientes: pendientes?.n ?? 0,
    hoy: hoy?.n ?? 0,
    ventasHoy: ventasHoy?.total ?? 0,
    ventasTotal: ventasTotal?.total ?? 0,
    pedidosVendidos: ventasTotal?.n ?? 0,
    ticketMedio: ventasTotal?.n ? Math.round((ventasTotal.total ?? 0) / ventasTotal.n) : 0,
    porEstado,
    ultimos,
  }
}

export async function getPedidos(filtros: { estado?: string; q?: string } = {}) {
  const condiciones = []

  if (filtros.estado && filtros.estado !== 'todos') {
    condiciones.push(eq(demoPedidos.estado, filtros.estado))
  }

  if (filtros.q?.trim()) {
    const q = `%${filtros.q.trim()}%`
    condiciones.push(
      or(
        ilike(demoPedidos.numero, q),
        ilike(demoPedidos.clienteNombre, q),
        ilike(demoPedidos.clienteEmail, q)
      )
    )
  }

  return db
    .select()
    .from(demoPedidos)
    .where(condiciones.length ? and(...condiciones) : undefined)
    .orderBy(desc(demoPedidos.creadoEn))
    .limit(100)
}

export async function getPedido(id: number) {
  const [pedido] = await db.select().from(demoPedidos).where(eq(demoPedidos.id, id))
  if (!pedido) return null

  const lineas = await db
    .select()
    .from(demoPedidoLineas)
    .where(eq(demoPedidoLineas.pedidoId, id))

  const mensajes = await db
    .select()
    .from(demoMensajes)
    .where(eq(demoMensajes.pedidoId, id))
    .orderBy(desc(demoMensajes.creadoEn))

  return { pedido, lineas, mensajes }
}

export async function getMensajes() {
  return db
    .select({
      id: demoMensajes.id,
      tipo: demoMensajes.tipo,
      destinatario: demoMensajes.destinatario,
      asunto: demoMensajes.asunto,
      cuerpo: demoMensajes.cuerpo,
      creadoEn: demoMensajes.creadoEn,
      numero: demoPedidos.numero,
      pedidoId: demoPedidos.id,
    })
    .from(demoMensajes)
    .leftJoin(demoPedidos, eq(demoMensajes.pedidoId, demoPedidos.id))
    .orderBy(desc(demoMensajes.creadoEn))
    .limit(100)
}
