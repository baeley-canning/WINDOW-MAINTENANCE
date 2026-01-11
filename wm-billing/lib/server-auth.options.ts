import type { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import { createTransport } from 'nodemailer'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier, url }) => {
        if (process.env.DEV_EMAIL_MODE === 'console' || !process.env.SMTP_HOST) {
          console.log('\n[auth] Magic link for', identifier, '\
\n', url, '\n')
          return
        }
        try {
          const smtpHost = process.env.SMTP_HOST!
          const smtpPort = Number(process.env.SMTP_PORT || 465)
          const smtpUser = process.env.SMTP_USER!
          const smtpPass = process.env.SMTP_PASS!
          const from = process.env.SMTP_FROM || smtpUser
          const transport = createTransport({ host: smtpHost, port: smtpPort, secure: smtpPort === 465, auth: { user: smtpUser, pass: smtpPass } })
          const result = await transport.sendMail({ to: identifier, from, subject: 'Sign in to Window Maintenance Billing', html: `<p>Kia ora,</p><p>Sign in by clicking <a href="${url}">this link</a>.</p>` })
          if (result.rejected.length) throw new Error('Email rejected by SMTP server')
        } catch (err: any) {
          console.error('[auth] Email send failed:', err?.message || err)
          throw new Error('Email send failed')
        }
      },
    }),
  ],
  pages: { signIn: '/signin' },
  callbacks: {
    async session({ session, user }) {
      (session.user as any).role = (user as any).role
      return session
    },
    async signIn({ user }) {
      await prisma.auditLog.create({ data: { action: 'LOGIN', subjectType: 'User', subjectId: user.id, meta: { email: user.email } } as any })
      return true
    },
  },
  events: {
    async createUser({ user }) {
      const count = await prisma.user.count()
      if (count === 1) {
        await prisma.user.update({ where: { id: user.id }, data: { role: 'OWNER' } })
      }
    },
  },
}
