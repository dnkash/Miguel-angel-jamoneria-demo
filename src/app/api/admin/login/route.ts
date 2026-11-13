import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, ADMIN_MAX_AGE, authenticate, createSessionToken } from '@/lib/admin-auth'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON no válido' }, { status: 400 })
  }

  const data = body as { username?: unknown; password?: unknown }
  const username = typeof data?.username === 'string' ? data.username : ''
  const password = typeof data?.password === 'string' ? data.password : ''

  const session = authenticate(username, password)
  if (!session) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  }

  const response = NextResponse.json({
    ok: true,
    usuario: session.username,
    rol: session.rol,
  })
  response.cookies.set(ADMIN_COOKIE, createSessionToken(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_MAX_AGE,
  })
  return response
}
