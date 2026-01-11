import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { generateInvoicePdf } from '@/lib/pdf'
import { sendMail } from '@/lib/sendmail'

export async function POST(req: Request) {
  const sig = headers().get('stripe-signature')
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const body = await req.text()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig!, whSecret)
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const invoiceId = session.metadata?.invoiceId as string
      if (invoiceId) {
        let method: 'card' | 'becs' = 'card'
        try {
          if (session.payment_intent) {
            const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string)
            if (pi.payment_method_types?.includes('au_becs_debit')) method = 'becs'
            const status = pi.status === 'succeeded' ? 'succeeded' : 'processing'
            await prisma.payment.create({ data: { invoiceId, provider: 'stripe', method: method === 'becs' ? 'becs' : 'card', amountCents: pi.amount || 0, feeCents: 0, netCents: pi.amount || 0, currency: (pi.currency || 'nzd') as string, status: status as any, stripePiId: pi.id } })
          } else {
            await prisma.payment.create({ data: { invoiceId, provider: 'stripe', method: 'card', amountCents: session.amount_total || 0, feeCents: 0, netCents: session.amount_total || 0, currency: session.currency || 'nzd', status: 'processing', stripePiId: session.payment_intent || undefined } })
          }
        } catch {}
        await prisma.invoice.update({ where: { id: invoiceId }, data: { status: 'SENT' } })
      }
      break
    }
    case 'payment_intent.succeeded': {
      const pi = event.data.object as any
      const invoiceId = pi.metadata?.invoiceId as string
      if (invoiceId) {
        // fetch fee/net via balance transaction on latest charge
        try {
          const latestCharge = (pi.charges?.data?.[0]?.id) ? pi.charges.data[0].id : (pi.latest_charge as string | undefined)
          if (latestCharge) {
            const charge = await stripe.charges.retrieve(latestCharge, { expand: ['balance_transaction'] })
            const bt: any = (charge as any).balance_transaction
            if (bt) {
              await prisma.payment.updateMany({ where: { stripePiId: pi.id }, data: { status: 'succeeded', feeCents: bt.fee ?? 0, netCents: bt.net ?? 0, balanceTxId: bt.id } })
            } else {
              await prisma.payment.updateMany({ where: { stripePiId: pi.id }, data: { status: 'succeeded' } })
            }
          } else {
            await prisma.payment.updateMany({ where: { stripePiId: pi.id }, data: { status: 'succeeded' } })
          }
        } catch {
          await prisma.payment.updateMany({ where: { stripePiId: pi.id }, data: { status: 'succeeded' } })
        }
        const inv = await prisma.invoice.update({ where: { id: invoiceId }, data: { status: 'PAID' } , include: { customer: true, items: true } })
        await prisma.auditLog.create({ data: { action: 'PAYMENT_SUCCEEDED', subjectType: 'Invoice', subjectId: inv.id, meta: { method: 'stripe', pi: pi.id } } as any })
        if (inv.customer?.email) {
          const pdf = await generateInvoicePdf(inv, 'PAID')
          const html = `<p>Kia ora ${inv.customer.name},</p><p>Your payment for Invoice <strong>${inv.number}</strong> has been received. Thank you.</p>`
          await sendMail({ to: inv.customer.email, subject: `Invoice ${inv.number} — receipt`, html, attachments: [{ filename: `Invoice-${inv.number}-PAID.pdf`, content: pdf }] })
        }
      }
      break
    }
    case 'payment_intent.processing': {
      const pi = event.data.object as any
      await prisma.payment.updateMany({ where: { stripePiId: pi.id }, data: { status: 'processing' } })
      break
    }
  }

  return new Response(null, { status: 200 })
}

export const runtime = 'edge'
