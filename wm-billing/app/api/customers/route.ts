import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'
import { z } from 'zod'

export async function GET() {
  await requireRole('STAFF')
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } })
  return Response.json(customers)
}

const CustomerSchema = z.object({ name: z.string().min(1), email: z.string().email().optional(), phone: z.string().optional(), address: z.string().optional() })
export async function POST(req: Request) {
  await requireRole('STAFF')
  const body = await req.json()
  const parsed = CustomerSchema.parse(body)
  const c = await prisma.customer.create({ data: parsed })
  return Response.json(c)
}

export async function PUT(req: Request) {
  await requireRole('STAFF')
  const body = await req.json()
  const schema = CustomerSchema.extend({ id: z.string() })
  const parsed = schema.parse(body)
  const { id, ...data } = parsed
  const c = await prisma.customer.update({ where: { id }, data })
  return Response.json(c)
}

export async function DELETE(req: Request) {
  await requireRole('STAFF')
  const { id } = await req.json()
  await prisma.customer.delete({ where: { id } })
  return new Response(null, { status: 204 })
}

