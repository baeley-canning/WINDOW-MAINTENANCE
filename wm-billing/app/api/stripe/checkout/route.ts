import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { redis } from '@/lib/redis'

export async function POST(req: Request) {
  const form = await req.formData()
  const invoiceId = String(form.get('invoiceId') || '')
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { customer: true } })
  if (!invoice) return new NextResponse('Not found', { status: 404 })
  const rl = await rateLimit(`checkout:${invoice.id}`)
  if (rl && 'success' in rl && !rl.success) return new NextResponse('Too Many Requests', { status: 429 })
  const pmTypes = (process.env.STRIPE_PAYMENT_METHOD_TYPES || 'card').split(',').map(s=>s.trim()).filter(Boolean)
  const idempotencyKey = `checkout:${invoice.id}`
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: invoice.currency,
    payment_method_types: pmTypes as any,
    success_url: `${process.env.PUBLIC_BASE_URL_PAY}/pay/${invoice.payLinkSlug}?success=1`,
    cancel_url: `${process.env.PUBLIC_BASE_URL_PAY}/pay/${invoice.payLinkSlug}?canceled=1`,
    customer_email: invoice.customer?.email || undefined,
    invoice_creation: { enabled: false },
    line_items: [
      { quantity: 1, price_data: { currency: invoice.currency, unit_amount: invoice.totalCents, product_data: { name: `Invoice ${invoice.number}` } } },
    ],
    metadata: { invoiceId: invoice.id, invoiceNumber: invoice.number },
  }, { idempotencyKey })
  if (redis) await redis.set(idempotencyKey, session.id, { ex: 300 })
  return NextResponse.redirect(session.url!, { status: 303 })
}
