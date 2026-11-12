import {
  pgTable,
  serial,
  bigserial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core'

export const categorias = pgTable('categorias', {
  id: integer('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  orden: integer('orden').default(0),
})

export const productos = pgTable('productos', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nombre: text('nombre').notNull(),
  categoriaId: integer('categoria_id').references(() => categorias.id),
  descripcion: text('descripcion').notNull(),
  precioCent: integer('precio_cent').notNull(),
  precioAntesCent: integer('precio_antes_cent'),
  formato: text('formato'),
  precinto: text('precinto'),
  alergenos: text('alergenos').array().default([]),
  ingredientes: text('ingredientes'),
  maridaje: text('maridaje'),
  racionesMin: integer('raciones_min'),
  racionesMax: integer('raciones_max'),
  imagen: text('imagen'),
  temporada: boolean('temporada').default(false),
  notaTemporada: text('nota_temporada'),
  oferta: boolean('oferta').default(false),
  ofertaFin: timestamp('oferta_fin', { withTimezone: true }),
  destacado: boolean('destacado').default(false),
  valoracion: numeric('valoracion', { precision: 2, scale: 1 }).default('5'),
  votos: integer('votos').default(0),
  stock: integer('stock').default(0),
  activo: boolean('activo').default(true),
  creadoEn: timestamp('creado_en', { withTimezone: true }).defaultNow(),
})

export const demoSuscriptores = pgTable('demo_suscriptores', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  creadoEn: timestamp('creado_en', { withTimezone: true }).defaultNow(),
})

export const demoPreguntas = pgTable('demo_preguntas', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  pregunta: text('pregunta').notNull(),
  respuestaChars: integer('respuesta_chars').notNull(),
  creadoEn: timestamp('creado_en', { withTimezone: true }).defaultNow(),
})
