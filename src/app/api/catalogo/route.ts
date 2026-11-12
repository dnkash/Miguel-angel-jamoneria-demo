import { NextResponse } from 'next/server'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { categorias, productos } from '@/db/schema'
import { CATEGORIAS, PRODUCTOS } from '@/data/catalog'

// Catálogo cacheado 5 minutos: Neon se consulta como mucho una vez cada 5 min.
export const revalidate = 300

export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await db
        .select({
          id: productos.id,
          slug: productos.slug,
          nombre: productos.nombre,
          descripcion: productos.descripcion,
          precio_cent: productos.precioCent,
          precio_antes_cent: productos.precioAntesCent,
          formato: productos.formato,
          precinto: productos.precinto,
          alergenos: productos.alergenos,
          ingredientes: productos.ingredientes,
          maridaje: productos.maridaje,
          raciones_min: productos.racionesMin,
          raciones_max: productos.racionesMax,
          imagen: productos.imagen,
          temporada: productos.temporada,
          nota_temporada: productos.notaTemporada,
          oferta: productos.oferta,
          oferta_fin: productos.ofertaFin,
          destacado: productos.destacado,
          valoracion: productos.valoracion,
          votos: productos.votos,
          stock: productos.stock,
          categoria_slug: categorias.slug,
          categoria: categorias.nombre,
        })
        .from(productos)
        .leftJoin(categorias, eq(productos.categoriaId, categorias.id))
        .where(eq(productos.activo, true))
        .orderBy(asc(productos.id))

      if (rows.length > 0) {
        return NextResponse.json(
          { productos: rows, categorias: CATEGORIAS },
          { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
        )
      }
    } catch (error) {
      console.error('[catalogo] Neon no disponible, usando catálogo estático:', error)
    }
  }

  return NextResponse.json(
    { productos: PRODUCTOS, categorias: CATEGORIAS },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
  )
}
