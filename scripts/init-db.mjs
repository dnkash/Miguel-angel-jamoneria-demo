// Aplica src/db/schema.sql en la base de datos Neon indicada por DATABASE_URL.
// Uso: node scripts/init-db.mjs
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL')
  process.exit(1)
}

const sql = neon(url)
const raw = readFileSync(new URL('../src/db/schema.sql', import.meta.url), 'utf8')

const statements = raw
  .split(/;\s*\n/)
  .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
  .filter(Boolean)

for (const statement of statements) {
  await sql.query(statement)
  console.log('OK:', statement.split('\n')[0].slice(0, 80))
}

const [{ n }] = await sql`select count(*)::int as n from productos`
console.log(`Productos en Neon: ${n}`)
