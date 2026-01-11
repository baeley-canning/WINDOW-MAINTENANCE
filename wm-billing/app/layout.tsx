import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Window Maintenance — Billing',
  description: 'Invoicing & Payments Portal',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-slate-950 text-slate-100">
        <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-12 gap-4 p-4">
          <aside className="col-span-12 md:col-span-3 lg:col-span-2">
            <div className="card sticky top-4">
              <div className="text-lg font-bold">WM Billing</div>
              <nav className="mt-3 grid gap-2 text-sm">
                <a className="hover:text-amber-400" href="/dashboard">Dashboard</a>
                <a className="hover:text-amber-400" href="/customers">Customers</a>
                <a className="hover:text-amber-400" href="/invoices">Invoices</a>
                <a className="hover:text-amber-400" href="/exports">Exports</a>
                <a className="hover:text-amber-400" href="/payouts">Payouts</a>
                <a className="hover:text-amber-400" href="/settings">Settings</a>
              </nav>
            </div>
          </aside>
          <main className="col-span-12 md:col-span-9 lg:col-span-10">{children}</main>
        </div>
      </body>
    </html>
  )
}
