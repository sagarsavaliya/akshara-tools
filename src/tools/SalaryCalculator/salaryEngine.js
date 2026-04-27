import { TAX_CONFIG } from '../../config/taxConfig.js'

function slabTax(income, slabs) {
  return slabs.reduce((total, [lower, upper, rate]) => {
    const cap = upper ?? Number.POSITIVE_INFINITY
    if (income <= lower) return total
    return total + (Math.min(income, cap) - lower) * rate
  }, 0)
}

export function clampCurrency(value) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 0
  return Math.max(0, numberValue)
}

function calculateNewRegimeRebate({ taxable, slabTaxAmount, config }) {
  const fullZeroUpto = config.REBATE_NEW_ZONE_FULL_ZERO
  if (typeof fullZeroUpto === 'number' && taxable <= fullZeroUpto) {
    return slabTaxAmount
  }
  if (taxable <= config.REBATE_NEW_LIMIT) {
    return Math.min(slabTaxAmount, config.REBATE_NEW_MAX)
  }
  if (taxable <= config.MARGINAL_RELIEF_UPPER) {
    const excessIncome = taxable - config.REBATE_NEW_LIMIT
    const normalTax = Math.max(0, slabTaxAmount - config.REBATE_NEW_MAX)
    return Math.max(0, normalTax - excessIncome)
  }
  return 0
}

function oldRegimeSlabsForAge(ageBracket, config) {
  if (ageBracket === '80+') return config.OLD_REGIME_SLABS.SUPER_SENIOR
  if (ageBracket === '60-79') return config.OLD_REGIME_SLABS.SENIOR
  return config.OLD_REGIME_SLABS.BELOW_60
}

function calculateOldRegimeRebate({ taxable, slabTaxAmount, ageBracket, config }) {
  if (ageBracket === '80+') return 0
  if (taxable <= config.REBATE_OLD_LIMIT) {
    return Math.min(slabTaxAmount, config.REBATE_OLD_MAX)
  }
  return 0
}

function pickSurchargeRateFixed(income, slabs) {
  let rate = 0
  for (const [lower, , r] of slabs) {
    if (income > lower) rate = r
  }
  return rate
}

function applySurchargeAndCess({ netTaxable, taxAfterRebate, regime, config }) {
  const slabs = regime === 'new'
    ? (config.SURCHARGE_SLABS_NEW ?? [[0, null, 0]])
    : (config.SURCHARGE_SLABS_OLD ?? [[0, null, 0]])
  const surchargeRate = pickSurchargeRateFixed(netTaxable, slabs)
  const surcharge = taxAfterRebate * surchargeRate
  const cess = (taxAfterRebate + surcharge) * config.CESS_RATE
  const totalTax = taxAfterRebate + surcharge + cess
  return {
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTax: Math.round(totalTax),
  }
}

function hraExemption({ basic, hra, rentPaidAnnual, cityType, config }) {
  if (!rentPaidAnnual) return 0
  const metroCapPct = cityType === 'metro' ? config.HRA_METRO_PCT : config.HRA_NONMETRO_PCT
  const rentMinusFloor = Math.max(0, rentPaidAnnual - basic * config.HRA_BASIC_FLOOR)
  const metroLimit = basic * metroCapPct
  return Math.min(hra, rentMinusFloor, metroLimit)
}

export function normalizeSalaried(raw = {}, config = TAX_CONFIG) {
  return {
    profile: 'salaried',
    ctc: clampCurrency(raw.ctc),
    basicPct: Math.min(0.6, Math.max(0.3, Number(raw.basicPct) || 0.4)),
    cityType: raw.cityType === 'nonmetro' ? 'nonmetro' : 'metro',
    rentPaidAnnual: clampCurrency(raw.rentPaidAnnual),
    professionalTaxMonthly: clampCurrency(raw.professionalTaxMonthly ?? 200),
    chapter80C_extra: clampCurrency(raw.chapter80C_extra ?? 150000),
    chapter80D: clampCurrency(raw.chapter80D ?? 25000),
    nps80ccd: clampCurrency(raw.nps80ccd ?? 0),
    employerPF: raw.employerPF !== false,
    taAnnual: clampCurrency(raw.taAnnual ?? 0),
    daAnnual: clampCurrency(raw.daAnnual ?? 0),
    ageBracket: raw.ageBracket === '60-79' || raw.ageBracket === '80+' ? raw.ageBracket : 'below60',
    config,
  }
}

export function normalizePension(raw = {}, config = TAX_CONFIG) {
  return {
    profile: 'retired_govt_pension',
    annualPension: clampCurrency(raw.annualPension),
    taAnnual: clampCurrency(raw.taAnnual ?? 0),
    daAnnual: clampCurrency(raw.daAnnual ?? 0),
    otherAnnual: clampCurrency(raw.otherAnnual ?? 0),
    professionalTaxMonthly: clampCurrency(raw.professionalTaxMonthly ?? 0),
    chapter80C: clampCurrency(raw.chapter80C ?? 0),
    chapter80D: clampCurrency(raw.chapter80D ?? 0),
    nps80ccd: clampCurrency(raw.nps80ccd ?? 0),
    ageBracket: raw.ageBracket === '60-79' || raw.ageBracket === '80+' ? raw.ageBracket : 'below60',
    config,
  }
}

export function buildSalariedBreakup(normalized, config = TAX_CONFIG) {
  const {
    ctc, basicPct, cityType, rentPaidAnnual, taAnnual, daAnnual, employerPF,
  } = normalized

  const basic = ctc * basicPct
  const hraRate = cityType === 'metro' ? config.HRA_METRO_PCT : config.HRA_NONMETRO_PCT
  const hra = basic * hraRate
  const gratuity = basic * (config.GRATUITY_NUMERATOR / config.GRATUITY_DENOMINATOR)
  const employerPFAnnual = employerPF
    ? Math.min(basic * 0.12, config.PF_EMPLOYER_CAP_ANNUAL)
    : 0
  const employeePFAnnual = Math.min(basic * 0.12, config.PF_EMPLOYEE_CAP_ANNUAL)
  const ta = taAnnual
  const da = daAnnual
  const specialAllowance = Math.max(
    0,
    ctc - basic - hra - gratuity - employerPFAnnual - ta - da,
  )
  const grossTaxable = Math.max(0, ctc - employerPFAnnual - gratuity)
  const hraExempt = hraExemption({
    basic, hra, rentPaidAnnual, cityType, config,
  })
  const professionalTaxAnnual = ctc > 0 ? normalized.professionalTaxMonthly * 12 : 0
  const chapter80C_extra_capped = Math.min(normalized.chapter80C_extra, config.CHAPTER80C_CAP)
  const chapter80D_capped = Math.min(normalized.chapter80D, config.CHAPTER80D_CAP)
  const nps_capped = Math.min(normalized.nps80ccd, config.NPS_80CCD_CAP)
  const total80C = Math.min(employeePFAnnual + chapter80C_extra_capped, config.CHAPTER80C_CAP)

  return {
    ctc,
    basic,
    hra,
    ta,
    da,
    gratuity,
    employerPFAnnual,
    employeePFAnnual,
    specialAllowance,
    grossTaxable,
    hraExempt,
    professionalTaxAnnual,
    chapter80C_extra_capped,
    chapter80D_capped,
    nps_capped,
    total80C,
  }
}

function salariedTaxForRegime(breakup, regime, ageBracket, config) {
  const {
    grossTaxable, hraExempt, total80C, chapter80D_capped, nps_capped,
  } = breakup
  const isNew = regime === 'new'
  const std = isNew ? config.STD_DEDUCTION_NEW : config.STD_DEDUCTION_OLD

  let netTaxable
  if (isNew) {
    netTaxable = Math.max(0, grossTaxable - std)
  } else {
    netTaxable = Math.max(
      0,
      grossTaxable - hraExempt - std - total80C - chapter80D_capped - nps_capped,
    )
  }

  const slabs = isNew ? config.NEW_REGIME_SLABS : oldRegimeSlabsForAge(ageBracket, config)
  const baseTax = slabTax(netTaxable, slabs)
  const rebate = isNew
    ? calculateNewRegimeRebate({ taxable: netTaxable, slabTaxAmount: baseTax, config })
    : calculateOldRegimeRebate({ taxable: netTaxable, slabTaxAmount: baseTax, ageBracket, config })

  const taxAfterRebate = Math.max(0, baseTax - rebate)
  const { totalTax, surcharge, cess } = applySurchargeAndCess({
    netTaxable,
    taxAfterRebate,
    regime,
    config,
  })

  const annualInHand = Math.max(
    0,
    breakup.ctc
      - breakup.employerPFAnnual
      - breakup.gratuity
      - breakup.employeePFAnnual
      - breakup.professionalTaxAnnual
      - totalTax,
  )

  return {
    regime,
    ageBracket,
    ctc: Math.round(breakup.ctc),
    grossTaxable: Math.round(grossTaxable),
    taxable: Math.round(netTaxable),
    rebate: Math.round(rebate),
    taxBeforeRebate: Math.round(baseTax),
    surcharge,
    cess,
    annualTax: totalTax,
    annualInHand: Math.round(annualInHand),
    monthlyInHand: Math.round(annualInHand / 12),
  }
}

function pensionTaxForRegime(normalized, regime, config) {
  const gross = normalized.annualPension + normalized.taAnnual + normalized.daAnnual + normalized.otherAnnual
  const isNew = regime === 'new'
  const std = isNew ? config.STD_DEDUCTION_NEW : config.STD_DEDUCTION_OLD
  const capped80C = Math.min(normalized.chapter80C, config.CHAPTER80C_CAP)
  const capped80D = Math.min(normalized.chapter80D, config.CHAPTER80D_CAP)
  const cappedNps = Math.min(normalized.nps80ccd, config.NPS_80CCD_CAP)

  let netTaxable
  if (isNew) {
    netTaxable = Math.max(0, gross - std)
  } else {
    netTaxable = Math.max(0, gross - std - capped80C - capped80D - cappedNps)
  }

  const slabs = isNew ? config.NEW_REGIME_SLABS : oldRegimeSlabsForAge(normalized.ageBracket, config)
  const baseTax = slabTax(netTaxable, slabs)
  const rebate = isNew
    ? calculateNewRegimeRebate({ taxable: netTaxable, slabTaxAmount: baseTax, config })
    : calculateOldRegimeRebate({
      taxable: netTaxable,
      slabTaxAmount: baseTax,
      ageBracket: normalized.ageBracket,
      config,
    })

  const taxAfterRebate = Math.max(0, baseTax - rebate)
  const { totalTax, surcharge, cess } = applySurchargeAndCess({
    netTaxable,
    taxAfterRebate,
    regime,
    config,
  })

  const profAnnual = normalized.professionalTaxMonthly * 12
  const annualInHand = Math.max(0, gross - profAnnual - totalTax)

  return {
    regime,
    ageBracket: normalized.ageBracket,
    ctc: Math.round(gross),
    grossTaxable: Math.round(gross),
    taxable: Math.round(netTaxable),
    rebate: Math.round(rebate),
    taxBeforeRebate: Math.round(baseTax),
    surcharge,
    cess,
    annualTax: totalTax,
    annualInHand: Math.round(annualInHand),
    monthlyInHand: Math.round(annualInHand / 12),
    profile: 'retired_govt_pension',
  }
}

export function compareRegimes(raw = {}) {
  const config = raw.config ?? TAX_CONFIG
  const profile = raw.profile ?? 'salaried'

  if (profile === 'retired_govt_pension') {
    const n = normalizePension(raw, config)
    const pensionBreakup = {
      annualPension: n.annualPension,
      ta: n.taAnnual,
      da: n.daAnnual,
      other: n.otherAnnual,
      grossAnnual: n.annualPension + n.taAnnual + n.daAnnual + n.otherAnnual,
      professionalTaxAnnual: n.professionalTaxMonthly * 12,
    }
    const newResult = pensionTaxForRegime(n, 'new', config)
    const oldResult = pensionTaxForRegime(n, 'old', config)
    const better = newResult.monthlyInHand >= oldResult.monthlyInHand ? 'new' : 'old'
    const savingAnnual = Math.abs(newResult.annualInHand - oldResult.annualInHand)
    return {
      new: newResult,
      old: oldResult,
      betterRegime: better,
      savingAnnual: Math.round(savingAnnual),
      profile,
      salaryBreakup: null,
      pensionBreakup,
    }
  }

  const n = normalizeSalaried(raw, config)
  const breakup = buildSalariedBreakup(n, config)
  const newResult = salariedTaxForRegime(breakup, 'new', n.ageBracket, config)
  const oldResult = salariedTaxForRegime(breakup, 'old', n.ageBracket, config)
  const better = newResult.monthlyInHand >= oldResult.monthlyInHand ? 'new' : 'old'
  const savingAnnual = Math.abs(newResult.annualInHand - oldResult.annualInHand)

  return {
    new: newResult,
    old: oldResult,
    betterRegime: better,
    savingAnnual: Math.round(savingAnnual),
    profile: 'salaried',
    salaryBreakup: breakup,
    pensionBreakup: null,
  }
}

/** Back-compat single-regime snapshot (uses full salaried / pension engine). */
export function calculateSalary({ regime = 'new', ...raw } = {}) {
  const c = compareRegimes(raw)
  return regime === 'new' ? c.new : c.old
}
