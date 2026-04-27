import { describe, expect, it } from 'vitest'
import { analyzePayroll, governmentTAMonthly } from './payrollAnalysis.js'
import { TAX_CONFIG } from '../../config/taxConfig.js'

describe('governmentTAMonthly', () => {
  it('Level 10 city X: TA base ₹7,200 + 60% DA on TA', () => {
    expect(governmentTAMonthly(10, 'X', TAX_CONFIG)).toBeCloseTo(7200 + 0.6 * 7200, 5)
  })
})

describe('analyzePayroll — government CPC', () => {
  it('matches reference breakup: Level 10, basic ₹56,100, city X', () => {
    const r = analyzePayroll({
      employmentType: 'central_govt',
      cityClass: 'X',
      basicMonthly: 56_100,
      payLevel: 10,
    })
    expect(r.grossMonthly).toBe(118_110)
    const by = (c) => r.rows.find((row) => row.component.startsWith(c))?.monthly
    expect(by('Basic')).toBe(56_100)
    expect(by('Dearness')).toBe(33_660)
    expect(by('House rent')).toBe(16_830)
    expect(by('Transport')).toBe(11_520)
    expect(by('Employee NPS')).toBe(8976)
    expect(r.npsGovtMonthly).toBeCloseTo(0.14 * (56_100 + 33_660), 5)
  })
})

describe('analyzePayroll — private CTC', () => {
  it('splits CTC into basic (50%), HRA, PF cap, gratuity, and special', () => {
    const r = analyzePayroll({
      employmentType: 'private',
      cityClass: 'X',
      annualCtc: 12_00_000,
    })
    expect(r.cashGrossMonthly).toBeGreaterThan(0)
    expect(r.annualCtc).toBe(12_00_000)
    const basic = r.rows.find((row) => row.component === 'Basic pay')?.monthly
    expect(basic).toBe(50_000)
  })
})
