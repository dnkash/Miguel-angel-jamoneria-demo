export type AdminRole = 'empleado' | 'encargado'

export function puedeCancelar(rol: AdminRole) {
  return rol === 'encargado'
}
