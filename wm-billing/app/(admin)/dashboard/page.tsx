import Link from 'next/link'
import { requireAuth } from '@/lib/server-auth'

export default async function Dashboard() {
  await requireAuth()
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/customers" className="card">Customers</Link>
        <Link href="/invoices" className="card">Invoices</Link>
        <Link href="/payouts" className="card">Payouts</Link>
        <Link href="/exports" className="card">Exports</Link>
      </div>
    </div>
  )
}

