import { NextResponse } from 'next/server'
import { and, desc, eq, gt, sql } from 'drizzle-orm'
import { db } from '@/db'
import { demoPedidos } from '@/db/schema'
import { getAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const url = new URL(request.url)
  const since = Number(url.searchParams.get('since') ?? 0)

  const [ultimo] = await db
    .select({ id: demoPedidos.id })
    .from(demoPedidos)
    .orderBy(desc(demoPedidos.id))
    .limit(1)

  const [pendientes] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(demoPedidos)
    .where(eq(demoPedidos.estado, 'pagado'))

  const nuevos =
    Number.isFinite(since) && since > 0
      ? await db
          .select({
            id: demoPedidos.id,
            numero: demoPedidos.numero,
            clienteNombre: demoPedidos.clienteNombre,
            totalCent: demoPedidos.totalCent,
            creadoEn: demoPedidos.creadoEn,
          })
          .from(demoPedidos)
          .where(and(gt(demoPedidos.id, since), eq(demoPedidos.estado, 'pagado')))
          .orderBy(desc(demoPedidos.id))
          .limit(5)
      : []

  return NextResponse.json({
    ultimoId: ultimo?.id ?? 0,
    pendientes: pendientes?.n ?? 0,
    nuevos,
  })
}
