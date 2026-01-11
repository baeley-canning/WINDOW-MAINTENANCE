import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'

export default async function CustomersPage() {
  await requireRole('STAFF')
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } })
  async function Create(formData: FormData) {
    'use server'
    await requireRole('STAFF')
    const name = String(formData.get('name')||'')
    const email = String(formData.get('email')||'') || undefined
    const phone = String(formData.get('phone')||'') || undefined
    const address = String(formData.get('address')||'') || undefined
    await prisma.customer.create({ data: { name, email, phone, address } })
  }
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold">Customers</h1>
      <form action={Create} className="card mt-6 grid gap-2 sm:grid-cols-2">
        <input className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" name="name" placeholder="Name" required />
        <input className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" name="email" placeholder="Email" />
        <input className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" name="phone" placeholder="Phone" />
        <input className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" name="address" placeholder="Address" />
        <div className="sm:col-span-2"><button className="btn btn-primary" type="submit">Add customer</button></div>
      </form>
      <div className="mt-6 grid gap-2">
        {customers.map(c => (
          <div key={c.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-slate-400">{c.email || ''} {c.phone ? `• ${c.phone}`: ''}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

