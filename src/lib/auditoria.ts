import { db } from '@/db'
import { demoAuditoria } from '@/db/schema'
import type { AdminRole } from '@/lib/admin-roles'

export async function registrarAuditoria(input: {
  usuario: string
  rol: AdminRole
  accion: string
  pedidoId?: number | null
  detalle?: string | null
}) {
  try {
    await db.insert(demoAuditoria).values({
      usuario: input.usuario,
      rol: input.rol,
      accion: input.accion,
      pedidoId: input.pedidoId ?? null,
      detalle: input.detalle ?? null,
    })
  } catch (error) {
    console.error('[auditoria] No se pudo registrar:', error)
  }
}
