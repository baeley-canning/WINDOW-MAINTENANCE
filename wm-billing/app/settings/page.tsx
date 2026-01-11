import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/server-auth'

export default async function SettingsPage() {
  await requireRole('OWNER')
  const s = await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1, businessName: process.env.BUSINESS_NAME || 'Window Maintenance', nzbn: String(process.env.NZBN || ''), gstRate: Number(process.env.GST_RATE || 0.15), defaultCurrency: process.env.CURRENCY || 'nzd', bankAccountName: process.env.BANK_ACCOUNT_NAME || 'Window Maintenance', bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER || '' } })
  async function Save(formData: FormData) {
    'use server'
    await requireRole('OWNER')
    const data = {
      businessName: String(formData.get('businessName')||''),
      nzbn: String(formData.get('nzbn')||''),
      gstNumber: String(formData.get('gstNumber')||''),
      gstRate: Number(formData.get('gstRate')||0.15),
      defaultCurrency: String(formData.get('defaultCurrency')||'nzd'),
      bankAccountName: String(formData.get('bankAccountName')||''),
      bankAccountNumber: String(formData.get('bankAccountNumber')||''),
    }
    await prisma.settings.update({ where: { id: 1 }, data })
  }
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <form action={Save} className="card mt-6 grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm">Business name</span>
          <input name="businessName" defaultValue={s.businessName} className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">NZBN</span>
          <input name="nzbn" defaultValue={s.nzbn} className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">GST number</span>
          <input name="gstNumber" defaultValue={s.gstNumber || ''} className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">GST rate</span>
          <input name="gstRate" type="number" step="0.01" defaultValue={s.gstRate} className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Default currency</span>
          <input name="defaultCurrency" defaultValue={s.defaultCurrency} className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Bank account name</span>
          <input name="bankAccountName" defaultValue={s.bankAccountName || ''} className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Bank account number</span>
          <input name="bankAccountNumber" defaultValue={s.bankAccountNumber || ''} className="rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" />
        </label>
        <div>
          <button className="btn btn-primary" type="submit">Save</button>
        </div>
      </form>
    </div>
  )
}

