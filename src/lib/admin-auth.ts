import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE = 'maj_admin'
export const ADMIN_MAX_AGE = 60 * 60 * 8

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? 'demo-admin-secret-change-me'
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex')
}

export function createSessionToken() {
  const exp = Date.now() + ADMIN_MAX_AGE * 1000
  const payload = `admin.${exp}`
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token?: string) {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [role, exp, signature] = parts
  if (role !== 'admin') return false
  if (!Number.isFinite(Number(exp)) || Number(exp) < Date.now()) return false
  const expected = sign(`${role}.${exp}`)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function isAdmin() {
  const store = await cookies()
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value)
}

export function checkPassword(password: string) {
  return password === (process.env.ADMIN_PASSWORD ?? 'demo1234')
}
