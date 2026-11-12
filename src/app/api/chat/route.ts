import { NextResponse } from 'next/server'
import { generateText, type ModelMessage } from 'ai'
import { openrouter, FREE_MODEL } from '@/lib/ai'
import { checkRateLimit } from '@/lib/rate-limit'
import { db } from '@/db'
import { preguntasIa } from '@/db/schema'
import { PRODUCTOS } from '@/data/catalog'

export const maxDuration = 60

interface Entrante {
  role: 'user' | 'assistant' | 'system'
  content: string
}

function normalizar(input: unknown): ModelMessage[] {
  if (!Array.isArray(input)) return []
  return input
    .filter(
      (m): m is Entrante =>
        !!m &&
        typeof m === 'object' &&
        typeof (m as Entrante).content === 'string' &&
        ['user', 'assistant', 'system'].includes((m as Entrante).role)
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }))
}

const CATALOGO = PRODUCTOS.map(
  (p) =>
    `- ${p.nombre} | ${(p.precio_cent / 100).toFixed(2)} € | ${p.formato} | ${p.categoria} | ` +
    `precinto ${p.precinto} | alérgenos: ${p.alergenos.length ? p.alergenos.join(', ') : 'ninguno'} | ` +
    `raciones: ${p.raciones_min}-${p.raciones_max} | stock: ${p.stock}${p.temporada ? ' | TEMPORADA' : ''}` +
    `${p.oferta ? ' | OFERTA' : ''}\n  ${p.descripcion}`
).join('\n')

const SYSTEM = `Eres el asistente de Miguel Ángel Jamonería, una jamonería del Mercado de Abastos de Salamanca (desde 1988). Respondes en español, cercano y breve (máximo 120 palabras o 5 líneas).

CATÁLOGO REAL (no inventes nada fuera de esta lista):
${CATALOGO}

REGLAS:
- Recomienda solo productos de la lista, con su precio exacto.
- Si el cliente da presupuesto, propone una combinación que no lo supere y suma el total.
- Si hay alergias, excluye los productos con esos alérgenos y avisa de que prevalece el etiquetado del envase.
- Envío gratis a partir de 90 €; entrega 24-48 h en península.
- Si preguntan algo ajeno a la tienda, redirige amablemente al catálogo.
- No uses Markdown: ni asteriscos, ni almohadillas, ni listas con guiones. Texto plano y claro.
- No des consejos médicos ni prometas stock que no aparezca.`

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const { success } = await checkRateLimit(`chat:${ip}`)
  if (!success) {
    return NextResponse.json(
      { error: 'Has hecho muchas preguntas seguidas. Espera un minuto y vuelve a probar.' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON no válido' }, { status: 400 })
  }

  const messages = normalizar((body as { messages?: unknown })?.messages)
  const pregunta = [...messages].reverse().find((m) => m.role === 'user')
  const textoPregunta = typeof pregunta?.content === 'string' ? pregunta.content.trim() : ''

  if (!textoPregunta) {
    return NextResponse.json({ error: 'Escribe una pregunta.' }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: openrouter(FREE_MODEL),
      system: SYSTEM,
      messages,
      maxOutputTokens: 700,
      temperature: 0.5,
    })

    const respuesta = text.trim() || 'No he podido preparar una respuesta. ¿Puedes reformular la pregunta?'

    if (process.env.DATABASE_URL) {
      try {
        await db.insert(preguntasIa).values({
          pregunta: textoPregunta,
          respuestaChars: respuesta.length,
        })
      } catch (error) {
        console.error('[chat] No se pudo guardar la pregunta:', error)
      }
    }

    return NextResponse.json({ respuesta })
  } catch (error) {
    console.error('[chat] Error llamando a OpenRouter:', error)
    return NextResponse.json(
      { error: 'El asistente no está disponible ahora mismo. Prueba en unos segundos.' },
      { status: 502 }
    )
  }
}
