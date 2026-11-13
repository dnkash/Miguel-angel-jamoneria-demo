import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, ADMIN_MAX_AGE, checkPassword, createSessionToken } from '@/lib/admin-auth'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON no válido' }, { status: 400 })
  }

  const password = typeof (body as { password?: unknown })?.password === 'string'
    ? (body as { password: string }).password
    : ''

  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_MAX_AGE,
  })
  return response
}
