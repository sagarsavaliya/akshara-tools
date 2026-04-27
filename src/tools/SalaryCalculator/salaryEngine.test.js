import { describe, expect, it } from 'vitest'
import { calculateSalary, compareRegimes } from './salaryEngine.js'

describe('calculateSalary', () => {
  it('gives zero annual tax for 6L CTC in new regime (full breakup model)', () => {
    const result = calculateSalary({ ctc: 600000 })
    expect(result.taxable).toBe(491862)
    expect(result.annualTax).toBe(0)
    expect(result.monthlyInHand).toBe(45238)
  })

  it('applies full rebate at 12L CTC under FY 2026 new-regime zone', () => {
    const result = calculateSalary({ ctc: 1200000 })
    expect(result.taxable).toBe(1080323)
    expect(result.taxBeforeRebate).toBe(48032)
    expect(result.rebate).toBe(48032)
    expect(result.annualTax).toBe(0)
    expect(result.monthlyInHand).toBe(94277)
  })

  it('zero tax when taxable is within ₹12.75L rebate zone (13L CTC)', () => {
    const result = calculateSalary({ ctc: 1300000 })
    expect(result.taxable).toBe(1178400)
    expect(result.taxBeforeRebate).toBe(57840)
    expect(result.rebate).toBe(57840)
    expect(result.annualTax).toBe(0)
    expect(result.monthlyInHand).toBe(102450)
  })

  it('computes positive tax when taxable is above rebate zone', () => {
    const result = calculateSalary({ ctc: 1500000 })
    expect(result.taxable).toBe(1374554)
    expect(result.rebate).toBe(0)
    expect(result.annualTax).toBe(89630)
    expect(result.monthlyInHand).toBe(111327)
  })

  it('sanitizes non-numeric and negative inputs', () => {
    const nonNumeric = calculateSalary({ ctc: Number.NaN })
    const negative = calculateSalary({ ctc: -250000 })

    expect(nonNumeric).toMatchObject({ ctc: 0, taxable: 0, annualTax: 0, monthlyInHand: 0 })
    expect(negative).toMatchObject({ ctc: 0, taxable: 0, annualTax: 0, monthlyInHand: 0 })
  })

  it('uses supplied config instead of hardcoded constants', () => {
    const customConfig = {
      STD_DEDUCTION_NEW: 0,
      STD_DEDUCTION_OLD: 0,
      NEW_REGIME_SLABS: [[0, null, 0.1]],
      OLD_REGIME_SLABS: {
        BELOW_60: [[0, null, 0.1]],
        SENIOR: [[0, null, 0.1]],
        SUPER_SENIOR: [[0, null, 0.1]],
      },
      REBATE_NEW_LIMIT: 0,
      REBATE_NEW_MAX: 0,
      MARGINAL_RELIEF_UPPER: 0,
      REBATE_OLD_LIMIT: 0,
      REBATE_OLD_MAX: 0,
      CESS_RATE: 0,
      GRATUITY_NUMERATOR: 0,
      GRATUITY_DENOMINATOR: 312,
      PF_EMPLOYER_CAP_ANNUAL: 0,
      PF_EMPLOYEE_CAP_ANNUAL: 0,
      HRA_METRO_PCT: 0.5,
      HRA_NONMETRO_PCT: 0.4,
      HRA_BASIC_FLOOR: 0.1,
      CHAPTER80C_CAP: 150000,
      CHAPTER80D_CAP: 100000,
      NPS_80CCD_CAP: 50000,
      SURCHARGE_SLABS_NEW: [[0, null, 0]],
      SURCHARGE_SLABS_OLD: [[0, null, 0]],
    }

    const result = calculateSalary({ ctc: 100000, regime: 'new', config: customConfig })
    expect(result.taxable).toBe(100000)
    expect(result.taxBeforeRebate).toBe(10000)
    expect(result.annualTax).toBe(10000)
  })

  it('compareRegimes returns new and old results', () => {
    const c = compareRegimes({ ctc: 15_00_000, ageBracket: 'below60' })
    expect(c.new.monthlyInHand).toBeGreaterThan(0)
    expect(c.old.monthlyInHand).toBeGreaterThan(0)
    expect(['new', 'old']).toContain(c.betterRegime)
  })
})
