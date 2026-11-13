import { and, desc, eq, gte, ilike, inArray, or, sql } from 'drizzle-orm'
import { db } from '@/db'
import { demoAuditoria, demoMensajes, demoPedidoLineas, demoPedidos, productos } from '@/db/schema'

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

export async function getAuditoriaPedido(pedidoId: number) {
  return db
    .select()
    .from(demoAuditoria)
    .where(eq(demoAuditoria.pedidoId, pedidoId))
    .orderBy(desc(demoAuditoria.creadoEn))
    .limit(50)
}

export async function getActividadReciente(limit = 8) {
  return db
    .select({
      id: demoAuditoria.id,
      usuario: demoAuditoria.usuario,
      rol: demoAuditoria.rol,
      accion: demoAuditoria.accion,
      pedidoId: demoAuditoria.pedidoId,
      detalle: demoAuditoria.detalle,
      creadoEn: demoAuditoria.creadoEn,
      numero: demoPedidos.numero,
    })
    .from(demoAuditoria)
    .leftJoin(demoPedidos, eq(demoAuditoria.pedidoId, demoPedidos.id))
    .orderBy(desc(demoAuditoria.creadoEn))
    .limit(limit)
}

export async function getStockBajo(limit = 6) {
  return db
    .select({
      slug: productos.slug,
      nombre: productos.nombre,
      stock: productos.stock,
    })
    .from(productos)
    .where(sql`${productos.stock} <= 10`)
    .orderBy(productos.stock)
    .limit(limit)
}

export async function getTopProductos(limit = 5) {
  return db
    .select({
      nombre: demoPedidoLineas.nombre,
      unidades: sql<number>`sum(${demoPedidoLineas.cantidad})::int`,
    })
    .from(demoPedidoLineas)
    .innerJoin(demoPedidos, eq(demoPedidoLineas.pedidoId, demoPedidos.id))
    .where(sql`${demoPedidos.estado} <> 'cancelado'`)
    .groupBy(demoPedidoLineas.nombre)
    .orderBy(sql`sum(${demoPedidoLineas.cantidad}) desc`)
    .limit(limit)
}

export async function getProductos() {
  return db
    .select({
      id: productos.id,
      slug: productos.slug,
      nombre: productos.nombre,
      precioCent: productos.precioCent,
      stock: productos.stock,
    })
    .from(productos)
    .orderBy(sql`${productos.stock} asc nulls last`, productos.nombre)
}

export async function getVentasSemana() {
  const filas = await db
    .select({
      dia: sql<string>`to_char(date_trunc('day', ${demoPedidos.creadoEn}), 'YYYY-MM-DD')`,
      total: sql<number>`coalesce(sum(${demoPedidos.totalCent}), 0)::int`,
      pedidos: sql<number>`count(*)::int`,
    })
    .from(demoPedidos)
    .where(sql`${demoPedidos.estado} <> 'cancelado' and ${demoPedidos.creadoEn} >= now() - interval '6 days'`)
    .groupBy(sql`date_trunc('day', ${demoPedidos.creadoEn})`)
    .orderBy(sql`date_trunc('day', ${demoPedidos.creadoEn})`)

  const dias = Array.from({ length: 7 }, (_, index) => {
    const fecha = new Date()
    fecha.setHours(0, 0, 0, 0)
    fecha.setDate(fecha.getDate() - (6 - index))
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
    const fila = filas.find((f) => f.dia === key)
    return {
      fecha: key,
      label: `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}`,
      total: fila?.total ?? 0,
      pedidos: fila?.pedidos ?? 0,
    }
  })

  return {
    dias,
    total: dias.reduce((suma, dia) => suma + dia.total, 0),
    pedidos: dias.reduce((suma, dia) => suma + dia.pedidos, 0),
  }
}
