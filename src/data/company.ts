export const COMPANY = {
  nombre: 'Miguel Ángel Jamonería',
  nombreFiscal: 'Miguel Ángel Jamonería — DEMO',
  cif: 'B00000000',
  direccion: 'Mercado de Abastos, C/ Correhuela, s/n',
  ciudad: 'Salamanca',
  codigoPostal: '37001',
  telefono: '600 000 000',
  email: 'demo@jamoneria.example',
  web: 'https://miguel-angel-jamoneria-demo.vercel.app',
  horario: 'Lunes a sábado, 9:00–14:00',
  iban: 'ES00 0000 0000 0000 0000 0000',
  demo: true,
} as const

export const ENVIO = {
  costeCent: 495,
  gratisDesdeCent: 9000,
  plazo: '24-48 h en península',
} as const

export const ESTADOS = [
  { id: 'pagado', label: 'Pedido recibido', descripcion: 'Hemos recibido tu pedido y el pago simulado.' },
  { id: 'preparando', label: 'En preparación', descripcion: 'Estamos cortando y preparando tu selección.' },
  { id: 'listo', label: 'Listo', descripcion: 'Tu pedido está preparado para recoger o enviar.' },
  { id: 'enviado', label: 'Enviado', descripcion: 'Tu pedido ha salido hacia su destino.' },
  { id: 'entregado', label: 'Entregado', descripcion: 'Pedido entregado. ¡Que lo disfrutes!' },
] as const

export type EstadoPedido = (typeof ESTADOS)[number]['id'] | 'cancelado'

export const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pagado: 'Pedido recibido',
  preparando: 'En preparación',
  listo: 'Listo',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}
