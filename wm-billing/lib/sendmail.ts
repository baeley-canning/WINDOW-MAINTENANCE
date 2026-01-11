import nodemailer from 'nodemailer'

export async function sendMail(opts: { to: string; subject: string; html: string; attachments?: { filename: string; content: Buffer }[] }) {
  const smtpHost = process.env.SMTP_HOST!
  const smtpPort = Number(process.env.SMTP_PORT || 465)
  const smtpUser = process.env.SMTP_USER!
  const smtpPass = process.env.SMTP_PASS!
  const from = process.env.SMTP_FROM || smtpUser
  const transport = nodemailer.createTransport({ host: smtpHost, port: smtpPort, secure: smtpPort === 465, auth: { user: smtpUser, pass: smtpPass } })
  const info = await transport.sendMail({ to: opts.to, from, subject: opts.subject, html: opts.html, attachments: opts.attachments })
  return info
}

