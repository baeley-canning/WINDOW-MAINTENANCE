import { getServerSession } from 'next-auth'
import { authOptions } from './server-auth.options'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/signin')
  return session
}

export async function requireRole(role: 'OWNER' | 'STAFF') {
  const session = await requireAuth()
  const userRole = (session.user as any)?.role as 'OWNER' | 'STAFF' | undefined
  if (!userRole) redirect('/signin')
  if (role === 'OWNER' && userRole !== 'OWNER') redirect('/dashboard')
  return session
}

