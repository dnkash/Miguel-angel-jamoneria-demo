import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { AdminRole } from './admin-roles'

export const ADMIN_COOKIE = 'maj_admin'
export const ADMIN_MAX_AGE = 60 * 60 * 8

export type AdminSession = {
  username: string
  nombre: string
  rol: AdminRole
}

const USERS: Array<AdminSession & { password: () => string }> = [
  {
    username: 'empleado',
    nombre: 'Empleado',
    rol: 'empleado',
    password: () => process.env.EMPLEADO_PASSWORD ?? '',
  },
  {
    username: 'encargado',
    nombre: 'Encargado',
    rol: 'encargado',
    password: () => process.env.ENCARGADO_PASSWORD ?? '',
  },
]

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? 'demo-admin-secret-change-me'
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex')
}

export function authenticate(username: string, password: string): AdminSession | null {
  const user = USERS.find((u) => u.username === username.trim().toLowerCase())
  if (!user) return null
  const expected = user.password()
  if (!expected || expected !== password) return null
  return { username: user.username, nombre: user.nombre, rol: user.rol }
}

export function createSessionToken(session: AdminSession) {
  const exp = Date.now() + ADMIN_MAX_AGE * 1000
  const payload = `${session.username}.${session.rol}.${exp}`
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token?: string): AdminSession | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 4) return null
  const [username, rol, exp, signature] = parts
  if (rol !== 'empleado' && rol !== 'encargado') return null
  if (!Number.isFinite(Number(exp)) || Number(exp) < Date.now()) return null

  const expected = sign(`${username}.${rol}.${exp}`)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  const user = USERS.find((u) => u.username === username && u.rol === rol)
  if (!user) return null

  return { username: user.username, nombre: user.nombre, rol: user.rol }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies()
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value)
}

export async function isAdmin() {
  return (await getAdminSession()) !== null
}
