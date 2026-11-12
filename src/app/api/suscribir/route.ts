import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { demoSuscriptores } from '@/db/schema'
import { checkRateLimit } from '@/lib/rate-limit'

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email no válido').max(200),
})

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const { success } = await checkRateLimit(`news:${ip}`)
  if (!success) {
    return NextResponse.json(
      { error: 'Demasiados intentos. Espera un minuto.' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON no válido' }, { status: 400 })
  }

  const parsed = emailSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Email no válido' },
      { status: 400 }
    )
  }

  if (process.env.DATABASE_URL) {
    try {
      await db
        .insert(demoSuscriptores)
        .values({ email: parsed.data.email })
        .onConflictDoNothing({ target: demoSuscriptores.email })
    } catch (error) {
      console.error('[suscribir] No se pudo guardar en Neon:', error)
      return NextResponse.json(
        { error: 'No hemos podido guardar tu email. Inténtalo más tarde.' },
        { status: 503 }
      )
    }
  }

  return NextResponse.json({ ok: true })
}
