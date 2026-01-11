import crypto from 'crypto'
import { cookies, headers } from 'next/headers'

export function issueCsrfCookie() {
  const c = cookies()
  let token = c.get('csrf')?.value
  if (!token) {
    token = crypto.randomBytes(16).toString('hex')
    c.set('csrf', token, { httpOnly: true, sameSite: 'lax', path: '/' })
  }
  return token
}

export function verifyCsrf(formToken: string | null) {
  const cookieToken = cookies().get('csrf')?.value
  if (!cookieToken || !formToken) return false
  return crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(formToken))
}

