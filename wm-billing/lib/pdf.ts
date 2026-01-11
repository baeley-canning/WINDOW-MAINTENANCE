import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { fromCents } from './money'

export async function generateInvoicePdf(invoice: any, stamp: 'TO PAY' | 'PAID') {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const { height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const drawText = (text: string, x: number, y: number, size = 12, f = font) => {
    page.drawText(text, { x, y, size, font: f, color: rgb(0.1, 0.1, 0.1) })
  }

  drawText('Window Maintenance', 50, height - 60, 18, bold)
  drawText(`NZBN: ${process.env.NZBN || ''}`, 50, height - 80)

  drawText(`Invoice: ${invoice.number}`, 50, height - 120, 16, bold)
  drawText(`Status: ${stamp}`, 50, height - 140)
  drawText(`Issue: ${new Date(invoice.issueDate).toLocaleDateString()}`, 50, height - 160)
  if (invoice.dueDate) drawText(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, height - 180)
  drawText(`To: ${invoice.customer?.name || ''}`, 350, height - 120)
  if (invoice.customer?.email) drawText(invoice.customer.email, 350, height - 140)
  if (invoice.customer?.address) drawText(invoice.customer.address, 350, height - 160)

  let y = height - 210
  drawText('Description', 50, y, 12, bold)
  drawText('Qty', 350, y, 12, bold)
  drawText('Unit', 400, y, 12, bold)
  drawText('Line', 480, y, 12, bold)
  y -= 20
  for (const it of invoice.items) {
    drawText(it.description, 50, y)
    drawText(String(it.qty), 350, y)
    drawText(`$${fromCents(it.unitCents)}`, 400, y)
    drawText(`$${fromCents(it.lineCents)}`, 480, y)
    y -= 18
  }

  y -= 10
  drawText(`Subtotal: $${fromCents(invoice.subtotalCents)}`, 400, y)
  y -= 18
  drawText(`GST: $${fromCents(invoice.gstCents)}`, 400, y)
  y -= 18
  drawText(`Total: $${fromCents(invoice.totalCents)}`, 400, y, 14, bold)

  y -= 40
  const bankName = process.env.BANK_ACCOUNT_NAME || 'Window Maintenance'
  const bankNum = process.env.BANK_ACCOUNT_NUMBER || ''
  drawText('Bank transfer:', 50, y, 12, bold)
  y -= 16
  drawText(`${bankName} — ${bankNum}`, 50, y)
  y -= 16
  drawText('Use invoice number as reference', 50, y)

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

