import { TAX_CONFIG } from '../../config/taxConfig.js'

function clampCurrency(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

function slabTax(income, slabs) {
  return slabs.reduce((total, [lower, upper, rate]) => {
    const cap = upper ?? Number.POSITIVE_INFINITY
    if (income <= lower) return total
    return total + (Math.min(income, cap) - lower) * rate
  }, 0)
}

function pickSurchargeRateFixed(income, slabs) {
  let rate = 0
  for (const [lower, , r] of slabs) {
    if (income > lower) rate = r
  }
  return rate
}

/** CPC transport allowance (monthly) including DA on TA element. */
export function governmentTAMonthly(payLevel, cityClass, config = TAX_CONFIG) {
  const higher = cityClass === 'X'
  const level = Math.max(1, Math.min(18, Math.round(Number(payLevel) || 1)))
  const daRate = config.GOVT_DA_RATE_EFFECTIVE_JAN_2026
  let base
  if (level >= 9) base = higher ? 7200 : 3600
  else if (level >= 3) base = higher ? 3600 : 1800
  else base = higher ? 1350 : 900
  return base + daRate * base
}

function newRegimeTaxAnnual({ taxableAnnual, config }) {
  const baseTax = slabTax(taxableAnnual, config.NEW_REGIME_SLABS)
  const rebate = taxableAnnual <= config.REBATE_NEW_ZONE_FULL_ZERO ? baseTax : 0
  const taxAfterRebate = Math.max(0, baseTax - rebate)
  const surchargeRate = pickSurchargeRateFixed(taxableAnnual, config.SURCHARGE_SLABS_NEW ?? [[0, null, 0]])
  const surcharge = taxAfterRebate * surchargeRate
  const cess = (taxAfterRebate + surcharge) * config.CESS_RATE
  const total = Math.round(taxAfterRebate + surcharge + cess)
  return {
    taxableAnnual: Math.round(taxableAnnual),
    slabTax: Math.round(baseTax),
    rebate: Math.round(rebate),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalAnnual: total,
  }
}

function oldRegimeSlabsForAge(ageBracket, config) {
  if (ageBracket === '80+') return config.OLD_REGIME_SLABS.SUPER_SENIOR
  if (ageBracket === '60-79') return config.OLD_REGIME_SLABS.SENIOR
  return config.OLD_REGIME_SLABS.BELOW_60
}

function oldRegimeTaxAnnual({
  taxableAnnual, ageBracket, config,
}) {
  const slabs = oldRegimeSlabsForAge(ageBracket, config)
  const baseTax = slabTax(taxableAnnual, slabs)
  let rebate = 0
  if (ageBracket !== '80+' && taxableAnnual <= config.REBATE_OLD_LIMIT) {
    rebate = Math.min(baseTax, config.REBATE_OLD_MAX)
  }
  const taxAfterRebate = Math.max(0, baseTax - rebate)
  const surchargeRate = pickSurchargeRateFixed(taxableAnnual, config.SURCHARGE_SLABS_OLD ?? [[0, null, 0]])
  const surcharge = taxAfterRebate * surchargeRate
  const cess = (taxAfterRebate + surcharge) * config.CESS_RATE
  const total = Math.round(taxAfterRebate + surcharge + cess)
  return {
    taxableAnnual: Math.round(taxableAnnual),
    slabTax: Math.round(baseTax),
    rebate: Math.round(rebate),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalAnnual: total,
  }
}

function analyzeGovernment(input, config = TAX_CONFIG) {
  const employmentType = input.employmentType === 'state_govt' ? 'state_govt' : 'central_govt'
  const cityClass = ['X', 'Y', 'Z'].includes(input.cityClass) ? input.cityClass : 'X'
  const basicMonthly = clampCurrency(input.basicMonthly)
  const payLevel = Math.round(Number(input.payLevel) || 10)
  const professionalTaxMonthly = clampCurrency(input.professionalTaxMonthly ?? 200)
  const ageBracket = input.ageBracket === '60-79' || input.ageBracket === '80+' ? input.ageBracket : 'below60'

  const daMonthly = basicMonthly * config.GOVT_DA_RATE_EFFECTIVE_JAN_2026
  const hraPct = config.GOVT_HRA_PCT_OF_BASIC[cityClass]
  const hraFloor = config.GOVT_HRA_MIN_MONTHLY[cityClass]
  const hraMonthly = Math.max(basicMonthly * hraPct, hraFloor)
  const taMonthly = governmentTAMonthly(payLevel, cityClass, config)
  const grossMonthly = basicMonthly + daMonthly + hraMonthly + taMonthly

  const npsEmployeeMonthly = 0.1 * (basicMonthly + daMonthly)
  const npsGovtMonthly = 0.14 * (basicMonthly + daMonthly)

  const annualGross = grossMonthly * 12
  const taxableAnnualNew = Math.max(0, annualGross - config.STD_DEDUCTION_NEW)
  const taxNew = newRegimeTaxAnnual({ taxableAnnual: taxableAnnualNew, config })

  const rentPaidAnnual = clampCurrency(input.rentPaidAnnual ?? 0)
  const basicAnnual = basicMonthly * 12
  const hraAnnual = hraMonthly * 12
  const hraMetroCapPct = cityClass === 'X' ? config.HRA_METRO_PCT : config.HRA_NONMETRO_PCT
  const hraExempt = rentPaidAnnual <= 0
    ? 0
    : Math.min(
      hraAnnual,
      Math.max(0, rentPaidAnnual - basicAnnual * config.HRA_BASIC_FLOOR),
      basicAnnual * hraMetroCapPct,
    )
  const chapter80C = Math.min(clampCurrency(input.chapter80C ?? 0), config.CHAPTER80C_CAP)
  const chapter80D = Math.min(clampCurrency(input.chapter80D ?? 0), config.CHAPTER80D_CAP)
  const nps80ccd = Math.min(clampCurrency(input.nps80ccd ?? 0), config.NPS_80CCD_CAP)
  const taxableAnnualOld = Math.max(
    0,
    annualGross - hraExempt - config.STD_DEDUCTION_OLD - chapter80C - chapter80D - nps80ccd,
  )
  const taxOld = oldRegimeTaxAnnual({ taxableAnnual: taxableAnnualOld, ageBracket, config })

  const tdsMonthlyNew = Math.round(taxNew.totalAnnual / 12)
  const tdsMonthlyOld = Math.round(taxOld.totalAnnual / 12)

  const netMonthlyNew = grossMonthly - npsEmployeeMonthly - professionalTaxMonthly - tdsMonthlyNew

  const rows = [
    { category: 'Earnings', component: 'Basic pay', monthly: Math.round(basicMonthly) },
    { category: 'Earnings', component: 'Dearness allowance (DA)', monthly: Math.round(daMonthly) },
    { category: 'Earnings', component: 'House rent allowance (HRA)', monthly: Math.round(hraMonthly) },
    { category: 'Earnings', component: 'Transport allowance (TA)', monthly: Math.round(taMonthly) },
    { category: 'Deductions', component: 'Employee NPS (10% of Basic + DA)', monthly: Math.round(npsEmployeeMonthly) },
    { category: 'Deductions', component: 'Professional tax', monthly: Math.round(professionalTaxMonthly) },
    { category: 'Deductions', component: 'Income tax (TDS) — new regime', monthly: tdsMonthlyNew },
    { category: 'Final', component: 'Net take-home (new regime)', monthly: Math.round(netMonthlyNew) },
  ]

  return {
    employmentType,
    cityClass,
    payLevel,
    regimeLabels: { new: 'New regime (default)', old: 'Old regime (with rent & Chapter VI-A)' },
    grossMonthly,
    annualGross,
    taxableAnnualNew: taxNew.taxableAnnual,
    taxNew,
    taxableAnnualOld: taxOld.taxableAnnual,
    taxOld,
    tdsMonthlyNew,
    tdsMonthlyOld,
    netTakeHomeMonthlyNew: Math.round(netMonthlyNew),
    netTakeHomeMonthlyOld: Math.round(
      grossMonthly - npsEmployeeMonthly - professionalTaxMonthly - tdsMonthlyOld,
    ),
    npsGovtMonthly,
    rows,
    meta: {
      daRatePct: config.GOVT_DA_RATE_EFFECTIVE_JAN_2026 * 100,
      noteGovtNpsEmployer: 'Employer NPS (14% of Basic + DA) is a benefit; it is not deducted from your take-home.',
    },
  }
}

function analyzePrivate(input, config = TAX_CONFIG) {
  const cityClass = ['X', 'Y', 'Z'].includes(input.cityClass) ? input.cityClass : 'X'
  const annualCtc = clampCurrency(input.annualCtc)
  const professionalTaxMonthly = clampCurrency(input.professionalTaxMonthly ?? 200)
  const ageBracket = input.ageBracket === '60-79' || input.ageBracket === '80+' ? input.ageBracket : 'below60'

  const basicAnnual = annualCtc * config.PRIVATE_BASIC_PCT_OF_CTC
  const basicMonthly = basicAnnual / 12
  const hraPct = config.PRIVATE_HRA_PCT_OF_BASIC[cityClass]
  const hraMonthly = basicMonthly * hraPct
  const hraAnnual = hraMonthly * 12

  const employerPfAnnual = Math.min(basicAnnual * 0.12, config.PF_MONTHLY_CAP * 12)
  const gratuityMonthly = (basicMonthly / 26) * (15 / 12)
  const gratuityAnnual = gratuityMonthly * 12

  const specialAnnual = Math.max(
    0,
    annualCtc - basicAnnual - hraAnnual - employerPfAnnual - gratuityAnnual,
  )
  const specialMonthly = specialAnnual / 12

  const cashGrossMonthly = basicMonthly + hraMonthly + specialMonthly
  const annualCashGross = cashGrossMonthly * 12

  const employeePfMonthly = Math.min(basicMonthly * 0.12, config.PF_MONTHLY_CAP)

  const taxableAnnualNew = Math.max(0, annualCashGross - config.STD_DEDUCTION_NEW)
  const taxNew = newRegimeTaxAnnual({ taxableAnnual: taxableAnnualNew, config })

  const rentPaidAnnual = clampCurrency(input.rentPaidAnnual ?? 0)
  const hraMetroCapPct = cityClass === 'X' ? config.HRA_METRO_PCT : config.HRA_NONMETRO_PCT
  const hraExempt = rentPaidAnnual <= 0
    ? 0
    : Math.min(
      hraAnnual,
      Math.max(0, rentPaidAnnual - basicAnnual * config.HRA_BASIC_FLOOR),
      basicAnnual * hraMetroCapPct,
    )
  const employeePfAnnual = employeePfMonthly * 12
  const chapter80C = Math.min(
    clampCurrency(input.chapter80C ?? 0) + employeePfAnnual,
    config.CHAPTER80C_CAP,
  )
  const chapter80D = Math.min(clampCurrency(input.chapter80D ?? 0), config.CHAPTER80D_CAP)
  const nps80ccd = Math.min(clampCurrency(input.nps80ccd ?? 0), config.NPS_80CCD_CAP)
  const taxableAnnualOld = Math.max(
    0,
    annualCashGross - hraExempt - config.STD_DEDUCTION_OLD - chapter80C - chapter80D - nps80ccd,
  )
  const taxOld = oldRegimeTaxAnnual({ taxableAnnual: taxableAnnualOld, ageBracket, config })

  const tdsMonthlyNew = Math.round(taxNew.totalAnnual / 12)
  const tdsMonthlyOld = Math.round(taxOld.totalAnnual / 12)

  const netMonthlyNew = cashGrossMonthly - employeePfMonthly - professionalTaxMonthly - tdsMonthlyNew

  const rows = [
    { category: 'Earnings', component: 'Basic pay', monthly: Math.round(basicMonthly) },
    { category: 'Earnings', component: 'House rent allowance (HRA)', monthly: Math.round(hraMonthly) },
    { category: 'Earnings', component: 'Special allowance', monthly: Math.round(specialMonthly) },
    { category: 'Deductions', component: 'Employee PF (12% of basic, capped)', monthly: Math.round(employeePfMonthly) },
    { category: 'Deductions', component: 'Professional tax', monthly: Math.round(professionalTaxMonthly) },
    { category: 'Deductions', component: 'Income tax (TDS) — new regime', monthly: tdsMonthlyNew },
    { category: 'Final', component: 'Net take-home (new regime)', monthly: Math.round(netMonthlyNew) },
  ]

  return {
    employmentType: 'private',
    cityClass,
    annualCtc,
    basicAnnual,
    employerPfAnnual,
    gratuityMonthly,
    gratuityAnnual,
    cashGrossMonthly,
    annualCashGross,
    taxableAnnualNew: taxNew.taxableAnnual,
    taxNew,
    taxableAnnualOld: taxOld.taxableAnnual,
    taxOld,
    tdsMonthlyNew,
    tdsMonthlyOld,
    netTakeHomeMonthlyNew: Math.round(netMonthlyNew),
    netTakeHomeMonthlyOld: Math.round(
      cashGrossMonthly - employeePfMonthly - professionalTaxMonthly - tdsMonthlyOld,
    ),
    rows,
    meta: {
      employerPfMonthly: employerPfAnnual / 12,
      gratuityMonthly,
      noteCtc: 'CTC also includes employer PF and gratuity accrual; those are not paid in cash each month.',
    },
  }
}

/**
 * High-precision payroll snapshot (private CTC model or government CPC model).
 * @param {object} input
 * @param {'private'|'central_govt'|'state_govt'} input.employmentType
 * @param {'X'|'Y'|'Z'} input.cityClass
 * @param {number} [input.annualCtc] private annual CTC
 * @param {number} [input.basicMonthly] govt monthly basic
 * @param {number} [input.payLevel] CPC pay level (1–18) for TA
 */
export function analyzePayroll(input = {}, config = TAX_CONFIG) {
  const type = input.employmentType ?? 'private'
  if (type === 'central_govt' || type === 'state_govt') {
    return analyzeGovernment({ ...input, employmentType: type }, config)
  }
  return analyzePrivate({ ...input, employmentType: 'private' }, config)
}
