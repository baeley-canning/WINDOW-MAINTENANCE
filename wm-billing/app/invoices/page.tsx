import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'

export default async function InvoicesPage() {
  await requireRole('STAFF')
  const invoices = await prisma.invoice.findMany({ include: { customer: true }, orderBy: { createdAt: 'desc' } })
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } })
  async function Create(formData: FormData) {
    'use server'
    await requireRole('STAFF')
    const number = String(formData.get('number')||'')
    const customerId = String(formData.get('customerId')||'')
    const issueDate = String(formData.get('issueDate')||new Date().toISOString())
    const payload = { number, customerId, issueDate, items: [{ description: 'Service', qty: 1, unitCents: 0, priceIncludesGst: false }] }
    await fetch(`${process.env.PUBLIC_BASE_URL_APP || 'http://localhost:3001'}/api/invoices`, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
  }
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <form action={Create} className="flex gap-2">
          <input name="number" className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" placeholder="INV-1234567" required />
          <select name="customerId" className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" required>
            <option value="">Select customer…</option>
            {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <input type="date" name="issueDate" className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" />
          <button className="btn btn-primary" type="submit">Create</button>
        </form>
      </div>
      <div className="mt-6 grid gap-3">
        {invoices.map(inv => (
          <Link key={inv.id} href={`/invoices/${inv.id}`} className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{inv.number} — {inv.customer?.name}</div>
                <div className="text-sm text-slate-400">{inv.status} • ${ (inv.totalCents/100).toFixed(2) }</div>
              </div>
              <div className="text-sm text-slate-400">{new Date(inv.issueDate).toLocaleDateString()}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

