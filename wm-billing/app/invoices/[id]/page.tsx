import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'
import { calcTotals } from '@/lib/money'
import Link from 'next/link'

export default async function InvoiceEditor({ params }: { params: { id: string } }) {
  await requireRole('STAFF')
  const inv = await prisma.invoice.findUnique({ where: { id: params.id }, include: { customer: true, items: true } })
  if (!inv) return <div className="p-6">Not found</div>

  async function Save(formData: FormData) {
    'use server'
    await requireRole('STAFF')
    const itemsJson = String(formData.get('items')||'[]')
    const items = JSON.parse(itemsJson) as { description: string; qty: number; unitCents: number; priceIncludesGst: boolean }[]
    const payload = { id: inv.id, number: inv.number, customerId: inv.customerId, issueDate: inv.issueDate.toISOString(), dueDate: inv.dueDate?.toISOString(), notes: inv.notes, currency: inv.currency, items }
    await fetch(`${process.env.PUBLIC_BASE_URL_APP || 'http://localhost:3001'}/api/invoices`, { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
  }

  async function SendToPay() {
    'use server'
    await requireRole('STAFF')
    await fetch(`${process.env.PUBLIC_BASE_URL_APP || 'http://localhost:3001'}/api/invoices/${inv.id}/send`, { method: 'POST' })
  }

  const totals = calcTotals(inv.items.map(i => ({ qty: i.qty, unitCents: i.unitCents, priceIncludesGst: i.priceIncludesGst })), Number(process.env.GST_RATE || 0.15))

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Draft Invoice for {inv.customer?.name}</h1>
        <Link href={`/pay/${inv.payLinkSlug}`} className="btn btn-outline">Public pay link</Link>
      </div>
      <form action={Save} className="card mt-6">
        <details open>
          <summary className="cursor-pointer font-semibold">Line Items</summary>
          <InvoiceItemsEditor items={inv.items} />
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer font-semibold">Dates</summary>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1"><span className="text-sm">Issue date</span><input type="date" defaultValue={new Date(inv.issueDate).toISOString().slice(0,10)} className="rounded bg-slate-900 p-2 ring-1 ring-white/10" /></label>
            <label className="grid gap-1"><span className="text-sm">Due date</span><input type="date" defaultValue={inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0,10) : ''} className="rounded bg-slate-900 p-2 ring-1 ring-white/10" /></label>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer font-semibold">Additional Settings</summary>
          <div className="mt-2">
            <label className="grid gap-1"><span className="text-sm">Notes</span><textarea defaultValue={inv.notes || ''} className="w-full rounded bg-slate-900 p-2 ring-1 ring-white/10" rows={3}></textarea></label>
          </div>
        </details>
        <input type="hidden" name="items" id="items-json" />
        <div className="mt-4 flex items-center gap-3">
          <button className="btn btn-primary" type="submit" formAction={Save}>Save</button>
          <button className="btn btn-outline" type="submit" formAction={SendToPay}>Send to pay</button>
        </div>
      </form>
      <div id="totals" className="mt-6 text-sm text-slate-300">Subtotal ${(totals.subtotalCents/100).toFixed(2)} • GST ${(totals.gstCents/100).toFixed(2)} • Total ${(totals.totalCents/100).toFixed(2)}</div>
    </div>
  )
}

function InvoiceItemsEditor({ items }: { items: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400">
            <th className="p-2">Description</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Unit (cents)</th>
            <th className="p-2">Incl GST?</th>
          </tr>
        </thead>
        <tbody id="rows">
          {items.map((i, idx) => (
            <tr key={i.id} className="border-t border-white/5">
              <td className="p-2"><input defaultValue={i.description} className="w-full rounded bg-slate-900 p-2 ring-1 ring-white/10" data-k="description" /></td>
              <td className="p-2"><input type="number" min={1} defaultValue={i.qty} className="w-20 rounded bg-slate-900 p-2 ring-1 ring-white/10" data-k="qty" /></td>
              <td className="p-2"><input type="number" min={0} defaultValue={i.unitCents} className="w-28 rounded bg-slate-900 p-2 ring-1 ring-white/10" data-k="unitCents" /></td>
              <td className="p-2"><input type="checkbox" defaultChecked={i.priceIncludesGst} data-k="priceIncludesGst" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-outline mt-3" type="button" onClick={() => {
        const tbody = document.getElementById('rows')!
        const tr = document.createElement('tr')
        tr.className = 'border-t border-white/5'
        tr.innerHTML = `<td class="p-2"><input class="w-full rounded bg-slate-900 p-2 ring-1 ring-white/10" data-k="description" /></td>
        <td class="p-2"><input type="number" min=1 value=1 class="w-20 rounded bg-slate-900 p-2 ring-1 ring-white/10" data-k="qty" /></td>
        <td class="p-2"><input type="number" min=0 value=0 class="w-28 rounded bg-slate-900 p-2 ring-1 ring-white/10" data-k="unitCents" /></td>
        <td class="p-2"><input type="checkbox" data-k="priceIncludesGst" /></td>`
        tbody.appendChild(tr)
        // update totals after adding a row
        // @ts-ignore
        window.recalc && window.recalc()
      }}>Add line</button>
      <script dangerouslySetInnerHTML={{ __html: `
        const GST = Number(${Number(process.env.GST_RATE || 0.15)});
        // live totals
        // @ts-ignore
        window.recalc = function() {
          const rows = Array.from(document.querySelectorAll('#rows tr'))
          let subtotal = 0, gst = 0
          for (const tr of rows) {
            const get = (k) => tr.querySelector('[data-k="'+k+'"]')
            const qty = Number(get('qty').value||1)
            const unit = Number(get('unitCents').value||0)
            const incl = get('priceIncludesGst').checked
            const line = qty * unit
            if (incl) {
              const ex = Math.round(line / (1 + GST));
              subtotal += ex; gst += (line - ex)
            } else {
              subtotal += line; gst += Math.round(line * GST)
            }
          }
          const total = subtotal + gst
          document.getElementById('totals').textContent = `Subtotal ${(subtotal/100).toFixed(2)} • GST ${(gst/100).toFixed(2)} • Total ${(total/100).toFixed(2)}`
        }
        const form = document.currentScript.closest('form');
        document.getElementById('rows').addEventListener('input', () => window.recalc())
        form.addEventListener('submit', () => {
          const rows = Array.from(document.querySelectorAll('#rows tr'))
          const items = rows.map(tr => {
            const get = (k) => tr.querySelector('[data-k="'+k+'"]')
            return {
              description: get('description').value,
              qty: Number(get('qty').value||1),
              unitCents: Number(get('unitCents').value||0),
              priceIncludesGst: get('priceIncludesGst').checked,
            }
          })
          document.getElementById('items-json').value = JSON.stringify(items)
        })
        window.recalc()
      ` }} />
    </div>
  )
}
