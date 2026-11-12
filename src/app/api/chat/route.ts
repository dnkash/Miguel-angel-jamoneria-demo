import { NextResponse } from 'next/server'
import { generateText, type ModelMessage } from 'ai'
import { openrouter, FREE_MODEL } from '@/lib/ai'
import { checkRateLimit } from '@/lib/rate-limit'
import { db } from '@/db'
import { demoPreguntas } from '@/db/schema'
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
    `- [${p.slug}] ${p.nombre} | ${euros(p.precio_cent)} | ${p.formato} | ${p.categoria} | ` +
    `alérgenos: ${p.alergenos.length ? p.alergenos.join(', ') : 'ninguno'} | stock: ${p.stock}` +
    `${p.temporada ? ' | TEMPORADA' : ''}${p.oferta ? ' | OFERTA' : ''}`
).join('\n')

const SYSTEM = `Eres el asistente de Miguel Ángel Jamonería, una jamonería del Mercado de Abastos de Salamanca (desde 1988). Respondes en español, cercano y breve (máximo 80 palabras o 4 líneas).

CATÁLOGO REAL (no inventes nada fuera de esta lista):
${CATALOGO}

REGLAS:
- Recomienda solo productos de la lista, con su precio exacto.
- Si el cliente da presupuesto, propone una combinación que no lo supere y suma el total.
- Da una única selección cerrada; no ofrezcas alternativas en la misma respuesta.
- Si hay alergias, excluye los productos con esos alérgenos y avisa de que prevalece el etiquetado del envase.
- Envío gratis a partir de 90 €; entrega 24-48 h en península.
- Si preguntan algo ajeno a la tienda, redirige amablemente al catálogo.
- No uses Markdown: ni asteriscos, ni almohadillas, ni listas con guiones. Texto plano y claro.
- Al final de cada respuesta añade una línea exacta con los slugs de los productos que recomiendas: SUGERENCIAS: slug1,slug2 (máximo 5, solo slugs de la lista). No escribas nada después.
- No des consejos médicos ni prometas stock que no aparezca.`

const norm = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9%]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const NOMBRES = PRODUCTOS.map((p) => ({ slug: p.slug, nombre: norm(p.nombre) }))

const ALIASES: [string, string][] = (() => {
  const map = new Map<string, string[]>()
  for (const p of PRODUCTOS) {
    const base = norm(p.nombre)
    const variants = new Set([
      base.replace(/\b100%\b/g, '').replace(/\s+/g, ' ').trim(),
      base.replace(/\b50%\b/g, '').replace(/\s+/g, ' ').trim(),
    ])
    for (const variant of variants) {
      if (variant.length < 10) continue
      map.set(variant, [...(map.get(variant) ?? []), p.slug])
    }
  }
  return [...map.entries()]
    .filter(([, slugs]) => slugs.length === 1)
    .map(([alias, slugs]) => [alias, slugs[0]] as [string, string])
})()

function extraerSlugs(texto: string): string[] {
  const t = norm(texto)
  if (!t) return []
  const exactos: string[] = []
  for (const { slug, nombre } of NOMBRES) {
    if (t.includes(nombre) && !exactos.includes(slug)) exactos.push(slug)
  }
  if (exactos.length > 0) return exactos

  const alias: string[] = []
  for (const [nombre, slug] of ALIASES) {
    if (t.includes(nombre) && !alias.includes(slug)) alias.push(slug)
  }
  return alias
}

const CONFIRMAR =
  /(^|\b)(si|vale|ok|okay|de acuerdo|perfecto|adelante|confirmo|confirmado|confirmar|lo quiero|los quiero|me lo llevo|me los llevo|anadelo|anadelos|anademe|anade|anadir|haz el pedido|hazme el pedido|quiero pedir|pedirlo|pedirlos|compralo|compralos|compra)(\b|$)/

const NEGACION = /(^|\b)(no|nunca|todavia no|aun no)(\b|$)/

function esConfirmacion(texto: string): boolean {
  const t = norm(texto)
  return t.length > 0 && t.length <= 180 && CONFIRMAR.test(t) && !NEGACION.test(t)
}

function euros(cent: number): string {
  return `${(cent / 100).toFixed(2).replace('.', ',')} €`
}

function construirPedido(slugs: string[], maxCent: number | null) {
  const vistos = new Set<string>()
  const items: { slug: string; cantidad: number }[] = []
  let total = 0
  for (const slug of slugs) {
    if (vistos.has(slug) || items.length >= 6) continue
    const producto = PRODUCTOS.find((p) => p.slug === slug)
    if (!producto || producto.stock <= 0) continue
    if (maxCent !== null && total + producto.precio_cent > maxCent) continue
    vistos.add(slug)
    items.push({ slug, cantidad: 1 })
    total += producto.precio_cent
  }
  return items
}

function extraerPresupuesto(textos: string[]): number | null {
  for (const texto of [...textos].reverse()) {
    const t = norm(texto)
    const conClave = t.match(/(?:presupuesto|por|con|de)\s+(?:de\s+)?(\d{1,4})(?:\s*(?:euros?|eur))?/)
    const conEuro = t.match(/(\d{1,4})\s*(?:euros?|eur)/)
    const match = conClave ?? conEuro
    if (!match) continue
    const euros = Number(match[1])
    if (Number.isFinite(euros) && euros >= 5 && euros <= 3000) return euros * 100
  }
  return null
}

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

  const payload = body as { messages?: unknown; sugerencias?: unknown }
  const messages = normalizar(payload.messages)
  const pregunta = [...messages].reverse().find((m) => m.role === 'user')
  const textoPregunta = typeof pregunta?.content === 'string' ? pregunta.content.trim() : ''

  if (!textoPregunta) {
    return NextResponse.json({ error: 'Escribe una pregunta.' }, { status: 400 })
  }

  const sugerenciasPrevias = Array.isArray(payload.sugerencias)
    ? payload.sugerencias
        .filter((s): s is string => typeof s === 'string')
        .filter((s) => PRODUCTOS.some((p) => p.slug === s))
        .slice(0, 8)
    : []

  const confirmado = esConfirmacion(textoPregunta)
  const presupuestoCent = extraerPresupuesto([
    ...messages.filter((m) => m.role === 'user').map((m) => String(m.content)),
  ])

  // Si el cliente confirma, montamos el pedido sin llamar al modelo:
  // productos que nombra + los que el asistente recomendó en el turno anterior.
  if (confirmado) {
    const delUsuario = extraerSlugs(textoPregunta)
    const delHistorial = messages
      .filter((m) => m.role === 'assistant' && typeof m.content === 'string')
      .flatMap((m) => extraerSlugs(m.content as string))
    const items = construirPedido([...delUsuario, ...sugerenciasPrevias, ...delHistorial], presupuestoCent)

    if (items.length > 0) {
      const detalle = items
        .map((item) => {
          const p = PRODUCTOS.find((x) => x.slug === item.slug)!
          return `${p.nombre} (${euros(p.precio_cent)})`
        })
        .join(', ')
      const total = items.reduce((sum, item) => {
        const p = PRODUCTOS.find((x) => x.slug === item.slug)!
        return sum + p.precio_cent * item.cantidad
      }, 0)

      const respuesta =
        `He añadido a tu cesta: ${detalle}. Total añadido: ${euros(total)}. ` +
        'He abierto la cesta para que revises el pedido; pulsa «Enviar pedido por WhatsApp» para confirmarlo.'

      if (process.env.DATABASE_URL) {
        try {
          await db.insert(demoPreguntas).values({
            pregunta: textoPregunta,
            respuestaChars: respuesta.length,
          })
        } catch (error) {
          console.error('[chat] No se pudo guardar la pregunta:', error)
        }
      }

      return NextResponse.json({
        respuesta,
        items,
        sugerencias: items.map((item) => item.slug),
      })
    }
  }

  try {
    const MODELOS = [FREE_MODEL, 'dots-studio/dots-3-note-preview:free']
    let text = ''

    for (const modelo of MODELOS) {
      try {
        const resultado = await generateText({
          model: openrouter(modelo),
          system: SYSTEM,
          messages,
          maxOutputTokens: 1200,
          temperature: 0.5,
        })
        text = resultado.text.trim()
        if (text) break
        console.warn(`[chat] ${modelo} devolvió respuesta vacía, probando fallback`)
      } catch (error) {
        console.error(`[chat] Error con ${modelo}:`, error)
      }
    }

    let respuesta =
      text ||
      'Ahora mismo no puedo consultar el catálogo. Dime cuántas personas sois y el presupuesto, y te preparo una selección en el puesto.'

    // El modelo cierra con "SUGERENCIAS: slug1,slug2"; es la vía fiable para
    // saber qué productos ha recomendado, sin depender de cómo escriba el nombre.
    const marcador = text.match(/\n?\s*SUGERENCIAS:\s*([a-z0-9,\-\s]+)\s*$/i)
    let sugerenciasTexto: string[] = []
    if (marcador) {
      sugerenciasTexto = marcador[1]
        .split(',')
        .map((s) => s.trim())
        .filter((s) => PRODUCTOS.some((p) => p.slug === s))
      respuesta = text.replace(marcador[0], '').trim()
    }
    if (sugerenciasTexto.length === 0) sugerenciasTexto = extraerSlugs(respuesta)
    const sugerencias = sugerenciasTexto.length ? sugerenciasTexto : sugerenciasPrevias
    let items: { slug: string; cantidad: number }[] = []

    if (confirmado) {
      items = construirPedido([...extraerSlugs(textoPregunta), ...sugerencias], presupuestoCent)
      if (items.length > 0) {
        const detalle = items
          .map((item) => {
            const p = PRODUCTOS.find((x) => x.slug === item.slug)!
            return `${p.nombre} (${euros(p.precio_cent)})`
          })
          .join(', ')
        respuesta += `\n\nHe añadido a tu cesta: ${detalle}. Revisa el pedido y pulsa «Enviar pedido por WhatsApp».`
      }
    }

    if (process.env.DATABASE_URL) {
      try {
        await db.insert(demoPreguntas).values({
          pregunta: textoPregunta,
          respuestaChars: respuesta.length,
        })
      } catch (error) {
        console.error('[chat] No se pudo guardar la pregunta:', error)
      }
    }

    return NextResponse.json({ respuesta, sugerencias, items })
  } catch (error) {
    console.error('[chat] Error llamando a OpenRouter:', error)
    return NextResponse.json(
      { error: 'El asistente no está disponible ahora mismo. Prueba en unos segundos.' },
      { status: 502 }
    )
  }
}
