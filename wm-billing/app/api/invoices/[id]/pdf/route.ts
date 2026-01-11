import { prisma } from '@/lib/prisma'
import { generateInvoicePdf } from '@/lib/pdf'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const inv = await prisma.invoice.findUnique({ where: { id: params.id }, include: { customer: true, items: true } })
  if (!inv) return new Response('Not found', { status: 404 })
  const stamp = inv.status === 'PAID' ? 'PAID' : 'TO PAY'
  const pdf = await generateInvoicePdf(inv, stamp as any)
  return new Response(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename=Invoice-${inv.number}-${stamp}.pdf` } })
}

