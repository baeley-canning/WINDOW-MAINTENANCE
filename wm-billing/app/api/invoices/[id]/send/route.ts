import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'
import { generateInvoicePdf } from '@/lib/pdf'
import { sendMail } from '@/lib/sendmail'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  await requireRole('STAFF')
  const invoice = await prisma.invoice.findUnique({ where: { id: params.id }, include: { customer: true, items: true } })
  if (!invoice) return new Response('Not found', { status: 404 })
  // mark sent if draft
  if (invoice.status === 'DRAFT') {
    await prisma.invoice.update({ where: { id: invoice.id }, data: { status: 'SENT' } })
  }
  const pdf = await generateInvoicePdf(invoice, 'TO PAY')
  const payUrl = `${process.env.PUBLIC_BASE_URL_PAY}/pay/${invoice.payLinkSlug}`
  const to = invoice.customer.email
  if (!to) return new Response('Customer has no email', { status: 422 })
  const subject = `Invoice ${invoice.number} — to pay`
  const html = `<p>Kia ora ${invoice.customer.name},</p><p>Please pay Invoice <strong>${invoice.number}</strong>. You can pay online or by bank transfer.</p><p><a href="${payUrl}">Pay invoice</a></p><p>Use the invoice number as reference if paying by bank transfer.</p>`
  await sendMail({ to, subject, html, attachments: [{ filename: `Invoice-${invoice.number}-TO-PAY.pdf`, content: pdf }] })
  return new Response(null, { status: 204 })
}

