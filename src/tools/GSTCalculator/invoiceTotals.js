import { round2 } from './gstEngine.js'

export function splitGstHalves(gstAmount) {
  const g = Number(gstAmount) || 0
  let cgst = Math.floor(g * 100 / 2) / 100
  let sgst = Math.floor(g * 100 / 2) / 100
  if (cgst + sgst < g) {
    sgst = round2(sgst + (g - (cgst + sgst)))
  }
  return { cgst, sgst }
}

/**
 * @param {Array<{ qty: number, rate: number, gstPct: number, cessPct?: number }>} lines
 * @param {boolean} isIntra — CGST+SGST vs IGST
 */
export function computeInvoiceTotals(lines, isIntra) {
  let subTaxable = 0
  let totalGst = 0
  let totalCgst = 0
  let totalSgst = 0
  let totalIgst = 0
  let totalCess = 0

  const lineRows = lines.map((line) => {
    const qty = Math.max(0, Number(line.qty) || 0)
    const rate = Math.max(0, Number(line.rate) || 0)
    const pct = Math.max(0, Number(line.gstPct) || 0)
    const cessPct = Math.max(0, Number(line.cessPct) || 0)
    const taxable = round2(qty * rate)
    const gst = Math.round(taxable * (pct / 100) * 100) / 100
    const cess = Math.round(taxable * (cessPct / 100) * 100) / 100
    let cgst = 0
    let sgst = 0
    let igst = 0
    if (isIntra) {
      const s = splitGstHalves(gst)
      cgst = s.cgst
      sgst = s.sgst
    } else {
      igst = gst
    }
    const total = round2(taxable + gst + cess)
    subTaxable += taxable
    totalGst += gst
    totalCess += cess
    totalCgst += cgst
    totalSgst += sgst
    totalIgst += igst
    return {
      ...line,
      taxable,
      gst,
      cgst,
      sgst,
      igst,
      cess,
      cessPct,
      total,
    }
  })

  return {
    lineRows,
    subtotalTaxable: round2(subTaxable),
    totalGst: round2(totalGst),
    totalCgst: round2(totalCgst),
    totalSgst: round2(totalSgst),
    totalIgst: round2(totalIgst),
    totalCess: round2(totalCess),
  }
}

export function grandTotalAfterDiscount(subtotalTaxable, totalGst, totalCess, discount) {
  const d = Math.max(0, Number(discount) || 0)
  const c = Math.max(0, Number(totalCess) || 0)
  return round2(subtotalTaxable + totalGst + c - d)
}
