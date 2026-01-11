"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function SignIn() {
  const [email, setEmail] = useState('')
  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-slate-300">Magic link will be sent to your email.</p>
      <form className="mt-4 card" onSubmit={async e => { e.preventDefault(); await signIn('email', { email, callbackUrl: '/dashboard' }) }}>
        <input className="w-full rounded-lg bg-slate-900 px-3 py-2 ring-1 ring-white/10" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="btn btn-primary mt-4" type="submit">Send magic link</button>
      </form>
    </div>
  )
}

