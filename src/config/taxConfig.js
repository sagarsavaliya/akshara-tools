/**
 * Central tax and payroll constants (planning model).
 * FY / AY labels follow product direction; verify against notified law before filing.
 */
export const TAX_CONFIG = {
  FY: '2026-27',
  AY: '2027-28',
  BUDGET_YEAR: 2026,
  LAST_VERIFIED: '2026-04-26',

  STD_DEDUCTION_NEW: 75000,
  STD_DEDUCTION_OLD: 50000,

  /** New regime: full rebate of slab tax when taxable income is at or below this (2026 rule set). */
  REBATE_NEW_ZONE_FULL_ZERO: 1275000,

  /** Legacy caps kept for old-regime paths in salaryEngine.js */
  REBATE_NEW_LIMIT: 1200000,
  REBATE_NEW_MAX: 60000,
  MARGINAL_RELIEF_UPPER: 1275000,

  REBATE_OLD_LIMIT: 500000,
  REBATE_OLD_MAX: 12500,

  PF_EMPLOYEE_CAP_ANNUAL: 21600,
  PF_EMPLOYER_CAP_ANNUAL: 21600,
  /** Private employer PF accrual cap per month (statutory wage ceiling model). */
  PF_MONTHLY_CAP: 1800,

  GRATUITY_NUMERATOR: 15,
  GRATUITY_DENOMINATOR: 312,

  HRA_METRO_PCT: 0.5,
  HRA_NONMETRO_PCT: 0.4,
  HRA_BASIC_FLOOR: 0.1,

  /** Private sector: basic as share of annual CTC (wage code style default). */
  PRIVATE_BASIC_PCT_OF_CTC: 0.5,
  /** Private HRA as share of monthly basic when not using govt CPC rules. */
  PRIVATE_HRA_PCT_OF_BASIC: { X: 0.5, Y: 0.4, Z: 0.3 },

  /** Government: DA effective Jan 2026 (60% of basic). */
  GOVT_DA_RATE_EFFECTIVE_JAN_2026: 0.6,
  /** When DA > 50%, HRA as % of basic by city class, with monthly minimums below. */
  GOVT_HRA_PCT_OF_BASIC: { X: 0.3, Y: 0.2, Z: 0.1 },
  GOVT_HRA_MIN_MONTHLY: { X: 5400, Y: 3600, Z: 1800 },

  CHAPTER80C_CAP: 150000,
  CHAPTER80D_CAP: 100000,
  NPS_80CCD_CAP: 50000,

  CESS_RATE: 0.04,

  NEW_REGIME_SLABS: [
    [0, 400000, 0],
    [400000, 800000, 0.05],
    [800000, 1200000, 0.1],
    [1200000, 1600000, 0.15],
    [1600000, 2000000, 0.2],
    [2000000, 2400000, 0.25],
    [2400000, null, 0.3],
  ],

  OLD_REGIME_SLABS: {
    BELOW_60: [
      [0, 250000, 0],
      [250000, 500000, 0.05],
      [500000, 1000000, 0.2],
      [1000000, null, 0.3],
    ],
    SENIOR: [
      [0, 300000, 0],
      [300000, 500000, 0.05],
      [500000, 1000000, 0.2],
      [1000000, null, 0.3],
    ],
    SUPER_SENIOR: [
      [0, 500000, 0],
      [500000, 1000000, 0.2],
      [1000000, null, 0.3],
    ],
  },

  SURCHARGE_SLABS_NEW: [
    [0, 5000000, 0],
    [5000000, 10000000, 0.1],
    [10000000, 20000000, 0.15],
    [20000000, null, 0.25],
  ],
  SURCHARGE_SLABS_OLD: [
    [0, 5000000, 0],
    [5000000, 10000000, 0.1],
    [10000000, 20000000, 0.15],
    [20000000, 50000000, 0.25],
    [50000000, null, 0.37],
  ],
}
