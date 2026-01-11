export function toCents(n: number) { return Math.round(n * 100) }
export function fromCents(c: number) { return (c / 100).toFixed(2) }
export function calcTotals(items: { qty: number; unitCents: number; priceIncludesGst: boolean }[], gstRate: number) {
  let subtotalEx = 0
  let gst = 0
  for (const it of items) {
    const lineUnits = it.qty * it.unitCents
    if (it.priceIncludesGst) {
      const ex = Math.round(lineUnits / (1 + gstRate))
      const g = lineUnits - ex
      subtotalEx += ex
      gst += g
    } else {
      subtotalEx += lineUnits
      gst += Math.round(lineUnits * gstRate)
    }
  }
  const total = subtotalEx + gst
  return { subtotalCents: subtotalEx, gstCents: gst, totalCents: total }
}

