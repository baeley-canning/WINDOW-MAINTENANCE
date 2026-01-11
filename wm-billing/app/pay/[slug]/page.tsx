import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { issueCsrfCookie } from '@/lib/csrf'

export default async function PayPage({ params }: { params: { slug: string } }) {
  const invoice = await prisma.invoice.findUnique({ where: { payLinkSlug: params.slug }, include: { customer: true } })
  if (!invoice) return <div className="p-6">Invoice not found</div>
  const csrf = issueCsrfCookie()
  const bankName = process.env.BANK_ACCOUNT_NAME || 'Window Maintenance'
  const bankNum = process.env.BANK_ACCOUNT_NUMBER || ''
  const payApi = '/api/stripe/checkout'
  const pmTypes = process.env.STRIPE_PAYMENT_METHOD_TYPES || 'card'
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Pay Invoice {invoice.number}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <div className="text-sm text-slate-400">Recommended</div>
          <h2 className="mt-1 font-semibold">Bank Account (BECS)</h2>
          <p className="mt-2 text-slate-300">Use your online banking to pay.</p>
          <div className="mt-4 space-y-1">
            <div className="text-sm">Account name: <strong>{bankName}</strong></div>
            <div className="text-sm">Account number: <strong>{bankNum}</strong></div>
            <div className="text-sm">Reference: <strong>{invoice.number}</strong></div>
          </div>
          <form className="mt-4" action="/api/payments/bank/create" method="POST">
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <input type="hidden" name="csrf" value={csrf} />
            <button className="btn btn-outline" type="submit">I will pay by bank transfer</button>
          </form>
        </div>
        <div className="card">
          <h2 className="font-semibold">Pay online</h2>
          <p className="mt-2 text-slate-300">{pmTypes.includes('becs') ? 'Bank account or card via Stripe' : 'Card via Stripe'}</p>
          <form className="mt-4" action={payApi} method="POST">
            <input type="hidden" name="invoiceId" value={invoice.id} />
            <button className="btn btn-primary" type="submit">Pay with Stripe</button>
          </form>
          <div className="mt-2 text-xs text-slate-400">Powered by Stripe Checkout</div>
        </div>
      </div>
      <div className="mt-6 text-sm text-slate-400">
        <Link href="/">Back to site</Link>
      </div>
    </div>
  )
}
