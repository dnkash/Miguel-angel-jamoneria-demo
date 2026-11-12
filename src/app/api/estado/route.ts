import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'
import { preguntasIa, productos } from '@/db/schema'
import { PRODUCTOS } from '@/data/catalog'

export const revalidate = 60

export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const [prod] = await db.select({ n: sql<number>`count(*)::int` }).from(productos)
      const [preg] = await db.select({ n: sql<number>`count(*)::int` }).from(preguntasIa)
      return NextResponse.json(
        { productos: prod?.n ?? PRODUCTOS.length, preguntas: preg?.n ?? 0 },
        { headers: { 'Cache-Control': 'public, s-maxage=60' } }
      )
    } catch (error) {
      console.error('[estado] Neon no disponible:', error)
    }
  }

  return NextResponse.json(
    { productos: PRODUCTOS.length, preguntas: null },
    { headers: { 'Cache-Control': 'public, s-maxage=60' } }
  )
}
