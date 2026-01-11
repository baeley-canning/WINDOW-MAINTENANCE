import { requireRole } from '@/lib/server-auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export default async function PayoutsPage() {
  await requireRole('OWNER')
  const balance = await stripe.balance.retrieve().catch(()=>({ available: [], pending: [] }) as any)
  const available = balance.available?.find((b:any)=>b.currency==='nzd')?.amount || 0
  async function PayoutNow() {
    'use server'
    await requireRole('OWNER')
    const bal = await stripe.balance.retrieve().catch(()=>({ available: [] }) as any)
    const nzd = bal.available?.find((b:any)=>b.currency==='nzd')?.amount || 0
    let payout: any = null
    if (nzd > 0) {
      payout = await stripe.payouts.create({ amount: nzd, currency: 'nzd' }).catch(()=>null)
    }
    await prisma.auditLog.create({ data: { action: 'PAYOUT_REQUESTED', subjectType: 'Stripe', subjectId: payout?.id || '-', meta: { amount: nzd, payout } } as any })
  }
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Payouts</h1>
      <div className="card mt-6">
        <div>Available balance (NZD): <strong>${(available/100).toFixed(2)}</strong></div>
        <form action={PayoutNow} className="mt-4">
          <button className="btn btn-primary" type="submit">Payout now</button>
        </form>
        <div className="mt-2 text-xs text-slate-400">Requires Stripe manual payout schedule.</div>
      </div>
    </div>
  )
}
