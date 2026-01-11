import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'

export async function GET() {
  await requireRole('STAFF')
  const rows = await prisma.customer.findMany({})
  const header = 'id,name,email,phone,address,createdAt\n'
  const csv = header + rows.map(r => [r.id, r.name, r.email||'', r.phone||'', JSON.stringify(r.address||''), r.createdAt.toISOString()].join(',')).join('\n')
  return new Response(csv, { headers: { 'Content-Type': 'text/csv' } })
}

