import { describe, expect, it } from 'vitest'
import { computeInvoiceTotals, grandTotalAfterDiscount, splitGstHalves } from './invoiceTotals.js'

describe('splitGstHalves', () => {
  it('splits with paise absorb on SGST', () => {
    const { cgst, sgst } = splitGstHalves(100.01)
    expect(cgst + sgst).toBeCloseTo(100.01, 2)
  })
})

describe('computeInvoiceTotals', () => {
  it('intra: sum CGST+SGST matches sum line GST within 0.01', () => {
    const { lineRows, totalGst, totalCgst, totalSgst } = computeInvoiceTotals(
      [
        { qty: 1, rate: 100, gstPct: 18, cessPct: 0, desc: 'A', hsn: '9983', unit: 'Nos' },
        { qty: 2, rate: 50.33, gstPct: 12, cessPct: 0, desc: 'B', hsn: '1234', unit: 'Nos' },
      ],
      true,
    )
    const sumLineGst = lineRows.reduce((s, r) => s + r.gst, 0)
    expect(Math.abs(sumLineGst - totalGst)).toBeLessThanOrEqual(0.02)
    expect(totalCgst + totalSgst).toBeCloseTo(totalGst, 2)
  })

  it('inter: IGST only', () => {
    const t = computeInvoiceTotals(
      [{ qty: 1, rate: 1000, gstPct: 18, cessPct: 0, desc: 'S', hsn: '', unit: 'Nos' }],
      false,
    )
    expect(t.totalIgst).toBeCloseTo(t.totalGst, 2)
    expect(t.totalCgst + t.totalSgst).toBe(0)
  })

  it('cess on taxable', () => {
    const t = computeInvoiceTotals(
      [{ qty: 1, rate: 1000, gstPct: 18, cessPct: 1, desc: 'X', hsn: '', unit: 'Nos' }],
      true,
    )
    expect(t.totalCess).toBe(10)
    expect(t.lineRows[0].total).toBeCloseTo(1000 + 180 + 10, 2)
  })
})

describe('grandTotalAfterDiscount', () => {
  it('includes cess', () => {
    expect(grandTotalAfterDiscount(1000, 180, 10, 0)).toBe(1190)
    expect(grandTotalAfterDiscount(1000, 180, 10, 100)).toBe(1090)
  })
})
