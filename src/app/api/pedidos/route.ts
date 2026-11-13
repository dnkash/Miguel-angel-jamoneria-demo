import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { demoMensajes, demoPedidoLineas, demoPedidos, productos } from '@/db/schema'
import { COMPANY, ENVIO } from '@/data/company'

export const maxDuration = 30

const itemSchema = z.object({
  slug: z.string().min(1).max(120),
  cantidad: z.coerce.number().int().min(1).max(20),
})

const pedidoSchema = z.object({
  items: z.array(itemSchema).min(1, 'La cesta está vacía').max(20),
  cliente: z.object({
    nombre: z.string().trim().min(2, 'Nombre requerido').max(100),
    email: z.string().trim().toLowerCase().email('Email no válido').max(200),
    telefono: z.string().trim().max(30).optional().default(''),
  }),
  entrega: z.enum(['envio', 'recogida']),
  direccion: z.string().trim().max(200).optional().default(''),
  ciudad: z.string().trim().max(100).optional().default(''),
  codigoPostal: z.string().trim().max(10).optional().default(''),
  notas: z.string().trim().max(500).optional().default(''),
})

function euros(cent: number) {
  return `${(cent / 100).toFixed(2).replace('.', ',')} €`
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'La demo necesita DATABASE_URL para guardar pedidos.' },
      { status: 503 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON no válido' }, { status: 400 })
  }

  const parsed = pedidoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos del pedido no válidos' },
      { status: 400 }
    )
  }

  const data = parsed.data

  if (data.entrega === 'envio' && (!data.direccion || !data.ciudad || !data.codigoPostal)) {
    return NextResponse.json(
      { error: 'Para envío necesitamos dirección, ciudad y código postal.' },
      { status: 400 }
    )
  }

  // Unir líneas repetidas y limitar cantidades.
  const cantidades = new Map<string, number>()
  for (const item of data.items) {
    cantidades.set(item.slug, Math.min(20, (cantidades.get(item.slug) ?? 0) + item.cantidad))
  }
  const slugs = [...cantidades.keys()]

  const filas = await db.select().from(productos).where(inArray(productos.slug, slugs))
  const porSlug = new Map(filas.map((p) => [p.slug, p]))

  const lineas: {
    productoSlug: string
    nombre: string
    precioCent: number
    cantidad: number
    subtotalCent: number
    alergenos: string[]
  }[] = []

  for (const [slug, cantidad] of cantidades) {
    const producto = porSlug.get(slug)
    if (!producto || !producto.activo) {
      return NextResponse.json({ error: `El producto ${slug} ya no está disponible.` }, { status: 409 })
    }
    if ((producto.stock ?? 0) < cantidad) {
      return NextResponse.json(
        { error: `Solo quedan ${producto.stock ?? 0} unidades de ${producto.nombre}.` },
        { status: 409 }
      )
    }
    lineas.push({
      productoSlug: producto.slug,
      nombre: producto.nombre,
      precioCent: producto.precioCent,
      cantidad,
      subtotalCent: producto.precioCent * cantidad,
      alergenos: producto.alergenos ?? [],
    })
  }

  const subtotalCent = lineas.reduce((sum, l) => sum + l.subtotalCent, 0)
  const envioCent = data.entrega === 'recogida' || subtotalCent >= ENVIO.gratisDesdeCent ? 0 : ENVIO.costeCent
  const totalCent = subtotalCent + envioCent

  const year = new Date().getFullYear()
  const numero = `MA-${year}-${randomUUID().slice(0, 4).toUpperCase()}`
  const token = randomUUID().replace(/-/g, '')

  const [pedido] = await db
    .insert(demoPedidos)
    .values({
      numero,
      token,
      estado: 'pagado',
      clienteNombre: data.cliente.nombre,
      clienteEmail: data.cliente.email,
      clienteTelefono: data.cliente.telefono || null,
      entregaTipo: data.entrega,
      direccion: data.entrega === 'envio' ? data.direccion : null,
      ciudad: data.entrega === 'envio' ? data.ciudad : COMPANY.ciudad,
      codigoPostal: data.entrega === 'envio' ? data.codigoPostal : COMPANY.codigoPostal,
      notas: data.notas || null,
      subtotalCent,
      envioCent,
      totalCent,
      pagoMetodo: 'demo',
      pagoEstado: 'simulado',
    })
    .returning()

  await db.insert(demoPedidoLineas).values(
    lineas.map((l) => ({
      pedidoId: pedido.id,
      productoSlug: l.productoSlug,
      nombre: l.nombre,
      precioCent: l.precioCent,
      cantidad: l.cantidad,
      subtotalCent: l.subtotalCent,
      alergenos: l.alergenos,
    }))
  )

  for (const linea of lineas) {
    await db
      .update(productos)
      .set({ stock: sql`greatest(${productos.stock} - ${linea.cantidad}, 0)` })
      .where(eq(productos.slug, linea.productoSlug))
  }

  const entregaTexto =
    data.entrega === 'recogida'
      ? `Recogida en ${COMPANY.direccion}, ${COMPANY.ciudad}. Horario: ${COMPANY.horario}.`
      : `Envío a ${data.direccion}, ${data.codigoPostal} ${data.ciudad}. Plazo: ${ENVIO.plazo}.`

  await db.insert(demoMensajes).values({
    pedidoId: pedido.id,
    tipo: 'email',
    destinatario: data.cliente.email,
    asunto: `Pedido ${numero} recibido · ${COMPANY.nombre}`,
    cuerpo:
      `Hola ${data.cliente.nombre}:\n\n` +
      `Hemos recibido tu pedido ${numero} por ${euros(totalCent)}.\n` +
      `Estamos preparando tu selección. Te avisaremos cuando esté listo.\n\n` +
      `${entregaTexto}\n\n` +
      `Este mensaje es una simulación de demo: no se ha enviado ningún email real ni se ha cobrado nada.`,
  })

  return NextResponse.json({
    numero,
    token,
    estado: pedido.estado,
    subtotalCent,
    envioCent,
    totalCent,
  })
}
