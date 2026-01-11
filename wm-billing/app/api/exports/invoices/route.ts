import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'

export async function GET() {
  await requireRole('STAFF')
  const rows = await prisma.invoice.findMany({ include: { customer: true } })
  const header = 'id,number,customer,status,issueDate,dueDate,currency,subtotalCents,gstCents,totalCents\n'
  const csv = header + rows.map(r => [r.id, r.number, r.customer?.name||'', r.status, r.issueDate.toISOString(), r.dueDate?.toISOString()||'', r.currency, r.subtotalCents, r.gstCents, r.totalCents].join(',')).join('\n')
  return new Response(csv, { headers: { 'Content-Type': 'text/csv' } })
}

