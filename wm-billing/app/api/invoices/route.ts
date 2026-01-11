import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'
import { calcTotals } from '@/lib/money'
import { z } from 'zod'

export async function GET() {
  await requireRole('STAFF')
  const invoices = await prisma.invoice.findMany({ include: { customer: true, items: true, payments: true }, orderBy: { createdAt: 'desc' } })
  return Response.json(invoices)
}

const Item = z.object({ description: z.string().min(1), qty: z.number().int().min(1), unitCents: z.number().int().min(0), priceIncludesGst: z.boolean().default(false) })
const InvoiceSchema = z.object({
  id: z.string().optional(),
  number: z.string().min(3),
  customerId: z.string().min(1),
  issueDate: z.string(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  currency: z.string().default('nzd'),
  items: z.array(Item).min(1),
})

export async function POST(req: Request) {
  await requireRole('STAFF')
  const body = await req.json()
  const parsed = InvoiceSchema.parse(body)
  const settings = await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1, businessName: process.env.BUSINESS_NAME || 'Window Maintenance', nzbn: String(process.env.NZBN || ''), gstRate: Number(process.env.GST_RATE || 0.15), defaultCurrency: process.env.CURRENCY || 'nzd' } })
  const totals = calcTotals(parsed.items, settings.gstRate)
  const created = await prisma.invoice.create({
    data: {
      number: parsed.number,
      customerId: parsed.customerId,
      issueDate: new Date(parsed.issueDate),
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      notes: parsed.notes,
      currency: parsed.currency,
      subtotalCents: totals.subtotalCents,
      gstCents: totals.gstCents,
      totalCents: totals.totalCents,
      status: 'DRAFT',
      payLinkSlug: crypto.randomUUID().slice(0, 10),
      items: { create: parsed.items.map(i => ({ description: i.description, qty: i.qty, unitCents: i.unitCents, lineCents: i.qty * i.unitCents, priceIncludesGst: i.priceIncludesGst })) },
    },
  })
  return Response.json(created)
}

export async function PUT(req: Request) {
  await requireRole('STAFF')
  const body = await req.json()
  const parsed = InvoiceSchema.extend({ id: z.string() }).parse(body)
  const settings = await prisma.settings.findUnique({ where: { id: 1 } })
  const gstRate = settings?.gstRate ?? Number(process.env.GST_RATE || 0.15)
  const totals = calcTotals(parsed.items, gstRate)
  const updated = await prisma.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId: parsed.id } })
    return tx.invoice.update({ where: { id: parsed.id }, data: {
      number: parsed.number,
      customerId: parsed.customerId,
      issueDate: new Date(parsed.issueDate),
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      notes: parsed.notes,
      currency: parsed.currency,
      subtotalCents: totals.subtotalCents,
      gstCents: totals.gstCents,
      totalCents: totals.totalCents,
      items: { create: parsed.items.map(i => ({ description: i.description, qty: i.qty, unitCents: i.unitCents, lineCents: i.qty * i.unitCents, priceIncludesGst: i.priceIncludesGst })) },
    } })
  })
  return Response.json(updated)
}

