import { requireRole } from '@/lib/server-auth'

export default async function ExportsPage() {
  await requireRole('STAFF')
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Exports</h1>
      <div className="mt-6 grid gap-3">
        <a className="btn btn-outline" href="/api/exports/customers">Customers CSV</a>
        <a className="btn btn-outline" href="/api/exports/invoices">Invoices CSV</a>
        <a className="btn btn-outline" href="/api/exports/payments">Payments CSV</a>
        <a className="btn btn-outline" href="/api/exports/xero">Xero-friendly CSV</a>
      </div>
    </div>
  )
}

