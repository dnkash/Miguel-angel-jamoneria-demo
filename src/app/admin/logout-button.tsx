'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const salir = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button type="button" className="admin__link" onClick={salir}>
      Salir
    </button>
  )
}
