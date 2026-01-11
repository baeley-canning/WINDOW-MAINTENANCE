import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'

export async function GET() {
  await requireRole('STAFF')
  const rows = await prisma.payment.findMany({ include: { invoice: true } })
  const header = 'id,invoiceNumber,provider,method,amountCents,feeCents,netCents,currency,status,createdAt\n'
  const csv = header + rows.map(r => [r.id, r.invoice?.number||'', r.provider, r.method, r.amountCents, r.feeCents, r.netCents, r.currency, r.status, r.createdAt.toISOString()].join(',')).join('\n')
  return new Response(csv, { headers: { 'Content-Type': 'text/csv' } })
}

