import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'

// Simple Xero-friendly CSV: Date, ContactName, InvoiceNumber, Description, Quantity, UnitAmount, AccountCode, TaxType
export async function GET() {
  await requireRole('STAFF')
  const invs = await prisma.invoice.findMany({ include: { customer: true, items: true } })
  const header = 'Date,ContactName,InvoiceNumber,Description,Quantity,UnitAmount,AccountCode,TaxType\n'
  const rows = invs.flatMap(inv => inv.items.map(it => [
    inv.issueDate.toISOString().slice(0,10),
    inv.customer?.name||'',
    inv.number,
    it.description,
    it.qty,
    (it.unitCents/100).toFixed(2),
    '200',
    it.priceIncludesGst ? 'GST on Expenses' : 'GST on Income',
  ].join(',')))
  return new Response(header + rows.join('\n'), { headers: { 'Content-Type': 'text/csv' } })
}

