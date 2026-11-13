import { NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { demoMensajes, demoPedidoLineas, demoPedidos, productos } from '@/db/schema'
import { isAdmin } from '@/lib/admin-auth'
import { COMPANY, ESTADO_LABEL, type EstadoPedido } from '@/data/company'

const estados = ['pagado', 'preparando', 'listo', 'enviado', 'entregado', 'cancelado'] as const

const schema = z.object({
  estado: z.enum(estados).optional(),
  notaInterna: z.string().max(1000).optional(),
})

function mensaje(estado: EstadoPedido, numero: string, nombre: string, entrega: string) {
  const saludo = `Hola ${nombre}:\n\n`
  const pie = '\n\nEste mensaje es una simulación de demo: no se ha enviado ningún email real.'

  switch (estado) {
    case 'preparando':
      return {
        asunto: `Estamos preparando tu pedido ${numero}`,
        cuerpo: `${saludo}Tu pedido ${numero} ya está en preparación. Te avisaremos en cuanto esté listo.${pie}`,
      }
    case 'listo':
      return {
        asunto: `Tu pedido ${numero} está listo`,
        cuerpo:
          `${saludo}Tu pedido ${numero} está preparado. ` +
          (entrega === 'recogida'
            ? `Puedes recogerlo en ${COMPANY.direccion}, ${COMPANY.ciudad}. Horario: ${COMPANY.horario}.`
            : 'En breve saldrá hacia tu dirección.') +
          pie,
      }
    case 'enviado':
      return {
        asunto: `Tu pedido ${numero} está en camino`,
        cuerpo: `${saludo}Tu pedido ${numero} ha salido. Plazo estimado: 24-48 h en península.${pie}`,
      }
    case 'entregado':
      return {
        asunto: `Pedido ${numero} entregado`,
        cuerpo: `${saludo}Tu pedido ${numero} ha sido entregado. ¡Que lo disfrutes!${pie}`,
      }
    case 'cancelado':
      return {
        asunto: `Pedido ${numero} cancelado`,
        cuerpo: `${saludo}Tu pedido ${numero} ha sido cancelado. Si tienes dudas, responde a este mensaje.${pie}`,
      }
    default:
      return {
        asunto: `Pedido ${numero} recibido`,
        cuerpo: `${saludo}Hemos recibido tu pedido ${numero}.${pie}`,
      }
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const pedidoId = Number(id)
  if (!Number.isInteger(pedidoId)) {
    return NextResponse.json({ error: 'Pedido no válido' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON no válido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos no válidos' }, { status: 400 })
  }

  const [pedido] = await db.select().from(demoPedidos).where(eq(demoPedidos.id, pedidoId))
  if (!pedido) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }

  const cambios: Record<string, unknown> = { actualizadoEn: new Date() }

  if (parsed.data.notaInterna !== undefined) {
    cambios.notaInterna = parsed.data.notaInterna
  }

  if (parsed.data.estado) {
    cambios.estado = parsed.data.estado
    const ahora = new Date()
    if (parsed.data.estado === 'preparando') cambios.preparadoEn = ahora
    if (parsed.data.estado === 'listo') cambios.listoEn = ahora
    if (parsed.data.estado === 'enviado') cambios.enviadoEn = ahora
    if (parsed.data.estado === 'entregado') cambios.entregadoEn = ahora
    if (parsed.data.estado === 'cancelado') cambios.canceladoEn = ahora
  }

  await db.update(demoPedidos).set(cambios).where(eq(demoPedidos.id, pedidoId))

  if (parsed.data.estado === 'cancelado' && pedido.estado !== 'cancelado') {
    const lineas = await db
      .select()
      .from(demoPedidoLineas)
      .where(eq(demoPedidoLineas.pedidoId, pedidoId))

    for (const linea of lineas) {
      await db
        .update(productos)
        .set({ stock: sql`${productos.stock} + ${linea.cantidad}` })
        .where(eq(productos.slug, linea.productoSlug))
    }
  }

  if (parsed.data.estado) {
    const plantilla = mensaje(
      parsed.data.estado as EstadoPedido,
      pedido.numero,
      pedido.clienteNombre,
      pedido.entregaTipo
    )
    await db.insert(demoMensajes).values({
      pedidoId: pedido.id,
      tipo: 'email',
      destinatario: pedido.clienteEmail,
      asunto: plantilla.asunto,
      cuerpo: plantilla.cuerpo,
    })
  }

  return NextResponse.json({
    ok: true,
    estado: parsed.data.estado ?? pedido.estado,
    estadoLabel: ESTADO_LABEL[(parsed.data.estado ?? pedido.estado) as EstadoPedido],
  })
}
