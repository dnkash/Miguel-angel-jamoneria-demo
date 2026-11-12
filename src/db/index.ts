import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('[db] DATABASE_URL no está definida: las funciones de base de datos fallarán.')
}

export const db = drizzle(neon(connectionString ?? ''), { schema })