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

export const demoPedidos = pgTable('demo_pedidos', {
  id: serial('id').primaryKey(),
  numero: text('numero').notNull().unique(),
  token: text('token').notNull().unique(),
  estado: text('estado').notNull().default('pagado'),
  clienteNombre: text('cliente_nombre').notNull(),
  clienteEmail: text('cliente_email').notNull(),
  clienteTelefono: text('cliente_telefono'),
  entregaTipo: text('entrega_tipo').notNull().default('envio'),
  direccion: text('direccion'),
  ciudad: text('ciudad'),
  codigoPostal: text('codigo_postal'),
  notas: text('notas'),
  notaInterna: text('nota_interna'),
  subtotalCent: integer('subtotal_cent').notNull(),
  envioCent: integer('envio_cent').notNull().default(0),
  totalCent: integer('total_cent').notNull(),
  pagoMetodo: text('pago_metodo').notNull().default('demo'),
  pagoEstado: text('pago_estado').notNull().default('simulado'),
  creadoEn: timestamp('creado_en', { withTimezone: true }).defaultNow(),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).defaultNow(),
  preparadoEn: timestamp('preparado_en', { withTimezone: true }),
  listoEn: timestamp('listo_en', { withTimezone: true }),
  enviadoEn: timestamp('enviado_en', { withTimezone: true }),
  entregadoEn: timestamp('entregado_en', { withTimezone: true }),
  canceladoEn: timestamp('cancelado_en', { withTimezone: true }),
})

export const demoPedidoLineas = pgTable('demo_pedido_lineas', {
  id: serial('id').primaryKey(),
  pedidoId: integer('pedido_id')
    .notNull()
    .references(() => demoPedidos.id, { onDelete: 'cascade' }),
  productoSlug: text('producto_slug').notNull(),
  nombre: text('nombre').notNull(),
  precioCent: integer('precio_cent').notNull(),
  cantidad: integer('cantidad').notNull(),
  subtotalCent: integer('subtotal_cent').notNull(),
  alergenos: text('alergenos').array().default([]),
})

export const demoMensajes = pgTable('demo_mensajes', {
  id: serial('id').primaryKey(),
  pedidoId: integer('pedido_id').references(() => demoPedidos.id, { onDelete: 'cascade' }),
  tipo: text('tipo').notNull().default('email'),
  destinatario: text('destinatario'),
  asunto: text('asunto').notNull(),
  cuerpo: text('cuerpo').notNull(),
  creadoEn: timestamp('creado_en', { withTimezone: true }).defaultNow(),
})
