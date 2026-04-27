import { describe, expect, it } from 'vitest'
import { computeGst, round2 } from './gstEngine.js'

describe('computeGst', () => {
  it('exclusive inter: 1,00,000 @ 18% IGST', () => {
    const r = computeGst({
      basis: 'exclusive',
      supply: 'inter',
      ratePct: 18,
      amount: 100000,
    })
    expect(r.taxableValue).toBe(100000)
    expect(r.gstAmount).toBe(18000)
    expect(r.igst).toBe(18000)
    expect(r.invoiceTotal).toBe(118000)
  })

  it('exclusive intra: CGST+SGST halves sum to GST', () => {
    const r = computeGst({
      basis: 'exclusive',
      supply: 'intra',
      ratePct: 18,
      amount: 100000,
    })
    expect(r.cgst + r.sgst).toBeCloseTo(r.gstAmount, 2)
    expect(r.igst).toBe(0)
  })

  it('inclusive inter: reverse base', () => {
    const r = computeGst({
      basis: 'inclusive',
      supply: 'inter',
      ratePct: 18,
      amount: 118000,
    })
    expect(r.taxableValue).toBe(100000)
    expect(r.gstAmount).toBe(18000)
    expect(r.invoiceTotal).toBe(118000)
  })

  it('round2', () => {
    expect(round2(100.11)).toBe(100.11)
    expect(round2(0.125)).toBe(0.13)
  })
})
