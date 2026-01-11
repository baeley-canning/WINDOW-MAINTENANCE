import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'
import { z } from 'zod'

export async function POST(req: Request) {
  await requireRole('STAFF')
  const body = await req.json()
  const schema = z.object({ invoiceId: z.string(), amountCents: z.number().int().min(0), reference: z.string().optional() })
  const { invoiceId, amountCents, reference } = schema.parse(body)
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } })
  if (!invoice) return new Response('Not found', { status: 404 })
  const payment = await prisma.payment.create({ data: {
    invoiceId,
    provider: 'bank',
    method: 'bank_transfer',
    amountCents,
    feeCents: 0,
    netCents: amountCents,
    status: 'succeeded',
    externalRef: reference,
  } })
  const paid = (invoice.payments?.filter(p=>p.status==='succeeded').reduce((s, p)=> s + p.amountCents, 0) || 0) + amountCents
  const newStatus = paid >= invoice.totalCents ? 'PAID' : 'PARTIALLY_PAID'
  const inv = await prisma.invoice.update({ where: { id: invoiceId }, data: { status: newStatus } , include: { customer: true, items: true } })
  await prisma.auditLog.create({ data: { action: 'BANK_RECEIVED', subjectType: 'Invoice', subjectId: invoiceId, meta: { amountCents, reference } } as any })
  if (newStatus === 'PAID' && inv.customer?.email) {
    const { generateInvoicePdf } = await import('@/lib/pdf')
    const { sendMail } = await import('@/lib/sendmail')
    const pdf = await generateInvoicePdf(inv, 'PAID')
    const html = `<p>Kia ora ${inv.customer.name},</p><p>Your payment for Invoice <strong>${inv.number}</strong> has been received. Thank you.</p>`
    await sendMail({ to: inv.customer.email, subject: `Invoice ${inv.number} — receipt`, html, attachments: [{ filename: `Invoice-${inv.number}-PAID.pdf`, content: pdf }] })
  }
  return Response.json(payment)
}
