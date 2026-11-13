import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/db'
import { productos } from '@/db/schema'
import { getAdminSession } from '@/lib/admin-auth'
import { registrarAuditoria } from '@/lib/auditoria'

const schema = z.object({
  stock: z.number().int().min(0).max(99999),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { slug } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON no válido' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Stock no válido' }, { status: 400 })
  }

  const [producto] = await db.select().from(productos).where(eq(productos.slug, slug))
  if (!producto) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  await db.update(productos).set({ stock: parsed.data.stock }).where(eq(productos.slug, slug))

  await registrarAuditoria({
    usuario: session.username,
    rol: session.rol,
    accion: 'ajuste_stock',
    detalle: `${producto.nombre}: ${producto.stock ?? 0} → ${parsed.data.stock}`,
  })

  return NextResponse.json({ ok: true, stock: parsed.data.stock })
}
