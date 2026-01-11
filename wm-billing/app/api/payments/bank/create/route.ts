import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/csrf'

export async function POST(req: Request) {
  const form = await req.formData()
  const invoiceId = String(form.get('invoiceId') || '')
  const csrf = String(form.get('csrf') || '')
  if (!verifyCsrf(csrf)) return new NextResponse('Bad CSRF', { status: 403 })
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
  if (!invoice) return new NextResponse('Not found', { status: 404 })
  await prisma.payment.create({ data: {
    invoiceId,
    provider: 'bank',
    method: 'bank_transfer',
    amountCents: invoice.totalCents,
    feeCents: 0,
    netCents: invoice.totalCents,
    status: 'pending_review',
  } })
  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: 'SENT' } })
  return NextResponse.redirect(new URL(`/pay/${invoice.payLinkSlug}`, process.env.PUBLIC_BASE_URL_PAY || 'http://localhost:3001'))
}
