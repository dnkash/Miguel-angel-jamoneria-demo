import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { LoginForm } from './login-form'

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin')
  return <LoginForm />
}
