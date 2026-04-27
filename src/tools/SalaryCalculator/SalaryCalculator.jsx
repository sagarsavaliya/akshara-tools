import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { TAX_CONFIG } from '../../config/taxConfig.js'
import { analyzePayroll } from './payrollAnalysis.js'
import styles from './SalaryCalculator.module.css'

const CTC_MIN = 100_000
const CTC_MAX = 5_00_00_000

function formatInr(value) {
  return `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`
}

const AGE_OPTIONS = [
  { value: 'below60', label: 'Under 60' },
  { value: '60-79', label: '60 to 79' },
  { value: '80+', label: '80 or above' },
]

const EMPLOYMENT_OPTIONS = [
  { value: 'private', label: 'Private', title: 'Private sector' },
  { value: 'central_govt', label: 'Central Govt', title: 'Central government' },
  { value: 'state_govt', label: 'State Govt', title: 'State government' },
]

const CITY_OPTIONS = [
  { value: 'X', label: 'X — Metro / higher TA' },
  { value: 'Y', label: 'Y — Non-metro' },
  { value: 'Z', label: 'Z — Rural / other' },
]

export default function SalaryCalculator() {
  const [employmentType, setEmploymentType] = useState('private')
  const [cityClass, setCityClass] = useState('X')
  const [annualCtc, setAnnualCtc] = useState(12_00_000)
  const [basicMonthly, setBasicMonthly] = useState(56_100)
  const [payLevel, setPayLevel] = useState(10)
  const [ageBracket, setAgeBracket] = useState('below60')
  const [rentPaidAnnual, setRentPaidAnnual] = useState(0)
  const [chapter80C, setChapter80C] = useState(0)
  const [chapter80D, setChapter80D] = useState(0)
  const [nps80ccd, setNps80ccd] = useState(0)

  const snapshot = useMemo(
    () =>
      analyzePayroll(
        employmentType === 'private'
          ? {
            employmentType: 'private',
            cityClass,
            annualCtc,
            ageBracket,
            rentPaidAnnual,
            chapter80C,
            chapter80D,
            nps80ccd,
            config: TAX_CONFIG,
          }
          : {
            employmentType,
            cityClass,
            basicMonthly,
            payLevel,
            ageBracket,
            rentPaidAnnual,
            chapter80C,
            chapter80D,
            nps80ccd,
            config: TAX_CONFIG,
          },
        TAX_CONFIG,
      ),
    [
      employmentType,
      cityClass,
      annualCtc,
      basicMonthly,
      payLevel,
      ageBracket,
      rentPaidAnnual,
      chapter80C,
      chapter80D,
      nps80ccd,
    ],
  )

  const netNew = snapshot.netTakeHomeMonthlyNew
  const netOld = snapshot.netTakeHomeMonthlyOld
  const better = netNew >= netOld ? 'new' : 'old'

  return (
    <>
      <Helmet>
        <title>
          India Salary Breakdown — Private &amp; Government | FY {TAX_CONFIG.FY} | Akshara Tools
        </title>
        <meta
          name="description"
          content="Monthly salary break-up for private CTC and government (7th CPC style) pay, with FY 2026-27 new regime TDS estimate. Planning only; verify before filing."
        />
      </Helmet>

      <div className={styles.toolPage}>
        <header className={styles.toolHeader}>
          <div className={styles.toolMeta}>
            <span className={styles.eyebrow}>Salary &amp; tax</span>
            <span className={styles.fyChip}>FY {TAX_CONFIG.FY}</span>
          </div>
          <h1 className={styles.title}>India salary breakdown</h1>
          <p className={styles.lede}>
            Choose <strong>private</strong> (annual CTC) or <strong>government</strong> (monthly basic + pay level).
            We apply DA, HRA, TA, PF/NPS, professional tax, and <strong>FY {TAX_CONFIG.FY}</strong> new-regime TDS
            (standard deduction ₹75,000; rebate up to taxable ₹12,75,000). Optional rent and Chapter VI-A feed the
            old-regime side estimate.
          </p>
        </header>

        <div className={styles.layout}>
          <aside className={styles.panel}>
            <p className={styles.panelTitle}>Inputs</p>

            <div className={styles.fieldGroup}>
              <span className={styles.label} id="employment-label">Employment</span>
              <div className={styles.segmentRow} role="group" aria-labelledby="employment-label">
                {EMPLOYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    title={opt.title}
                    className={
                      employmentType === opt.value
                        ? `${styles.segmentBtn} ${styles.segmentBtnActive}`
                        : styles.segmentBtn
                    }
                    onClick={() => setEmploymentType(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="city-class">City class (HRA / TA)</label>
              <select
                id="city-class"
                className={`${styles.field} ${styles.select}`}
                value={cityClass}
                onChange={(e) => setCityClass(e.target.value)}
              >
                {CITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {employmentType === 'private' ? (
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="ctc-input">Annual CTC (₹)</label>
                <input
                  id="ctc-input"
                  className={styles.field}
                  type="number"
                  inputMode="numeric"
                  min={CTC_MIN}
                  max={CTC_MAX}
                  value={annualCtc}
                  onChange={(e) => setAnnualCtc(Number(e.target.value) || 0)}
                />
                <input
                  className={styles.range}
                  type="range"
                  min={CTC_MIN}
                  max={CTC_MAX}
                  step={50_000}
                  value={Math.min(CTC_MAX, Math.max(CTC_MIN, annualCtc))}
                  onChange={(e) => setAnnualCtc(Number(e.target.value))}
                  aria-label="Annual CTC slider"
                />
                <p className={styles.hint}>
                  Basic taken as {TAX_CONFIG.PRIVATE_BASIC_PCT_OF_CTC * 100}% of CTC; employer PF 12% of basic capped at
                  {' '}{formatInr(TAX_CONFIG.PF_MONTHLY_CAP)}/mo on wage ceiling model; gratuity accrual (Basic÷26)×15÷12.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="basic-input">Monthly basic pay (₹)</label>
                  <input
                    id="basic-input"
                    className={styles.field}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={basicMonthly}
                    onChange={(e) => setBasicMonthly(Number(e.target.value) || 0)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="level-input">Pay level (1–18, for TA)</label>
                  <input
                    id="level-input"
                    className={styles.field}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={18}
                    value={payLevel}
                    onChange={(e) => setPayLevel(Number(e.target.value) || 1)}
                  />
                  <p className={styles.hint}>
                    DA {TAX_CONFIG.GOVT_DA_RATE_EFFECTIVE_JAN_2026 * 100}% of basic (from Jan 2026 model); HRA % of basic with monthly floors; TA by level and city class.
                  </p>
                </div>
              </>
            )}

            <fieldset className={styles.radioFieldset}>
              <legend className={styles.radioLegend}>Age (old regime slabs)</legend>
              <div className={styles.radioRow}>
                {AGE_OPTIONS.map((opt) => (
                  <label key={opt.value} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="ageBracket"
                      value={opt.value}
                      checked={ageBracket === opt.value}
                      onChange={() => setAgeBracket(opt.value)}
                    />
                    <span className={styles.radioFace}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <details className={styles.details}>
              <summary className={styles.detailsSummary}>Old regime inputs (optional)</summary>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="rent">Annual rent paid (₹)</label>
                <input
                  id="rent"
                  className={styles.field}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={rentPaidAnnual || ''}
                  placeholder="0"
                  onChange={(e) => setRentPaidAnnual(Number(e.target.value) || 0)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="80c">Chapter 80C (excl. PF for private — PF is added automatically)</label>
                <input
                  id="80c"
                  className={styles.field}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={chapter80C || ''}
                  placeholder="0"
                  onChange={(e) => setChapter80C(Number(e.target.value) || 0)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="80d">Chapter 80D (₹)</label>
                <input
                  id="80d"
                  className={styles.field}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={chapter80D || ''}
                  placeholder="0"
                  onChange={(e) => setChapter80D(Number(e.target.value) || 0)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="nps">NPS 80CCD(1B) (₹)</label>
                <input
                  id="nps"
                  className={styles.field}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={nps80ccd || ''}
                  placeholder="0"
                  onChange={(e) => setNps80ccd(Number(e.target.value) || 0)}
                />
              </div>
            </details>
          </aside>

          <section className={styles.results}>
            <div className={styles.summaryRow}>
              <div className={styles.hero}>
                <p className={styles.heroLabel}>Net take-home (new regime)</p>
                <p className={styles.heroValue}>
                  {formatInr(netNew)}
                  <span className={styles.heroSuffix}>/ month</span>
                </p>
                <div className={styles.heroNotes}>
                  <p className={styles.heroNoteLine}>
                    Old regime estimate: <strong>{formatInr(netOld)}/mo</strong>
                  </p>
                  <p className={styles.heroNoteLine}>
                    {netNew !== netOld
                      ? `${better === 'new' ? 'New' : 'Old'} regime is higher on these inputs`
                      : 'Same outcome on these inputs'}
                  </p>
                </div>
              </div>
              <div className={styles.compareCard}>
                <p className={styles.compareTitle}>New regime TDS</p>
                <p className={styles.compareValue}>{formatInr(snapshot.tdsMonthlyNew)}/mo</p>
                <div className={styles.compareMetaStack}>
                  <p className={styles.compareMetaLine}>
                    Taxable (annual) {formatInr(snapshot.taxableAnnualNew)}
                  </p>
                  <p className={styles.compareMetaLine}>
                    IT + cess (annual) {formatInr(snapshot.taxNew.totalAnnual)}
                  </p>
                </div>
              </div>
              <div className={styles.compareCard}>
                <p className={styles.compareTitle}>Old regime TDS</p>
                <p className={styles.compareValue}>{formatInr(snapshot.tdsMonthlyOld)}/mo</p>
                <div className={styles.compareMetaStack}>
                  <p className={styles.compareMetaLine}>
                    Taxable (annual) {formatInr(snapshot.taxableAnnualOld)}
                  </p>
                  <p className={styles.compareMetaLine}>
                    IT + cess (annual) {formatInr(snapshot.taxOld.totalAnnual)}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <p className={styles.tableTitle}>Monthly break-up</p>
              <table className={styles.breakdownTable}>
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Component</th>
                    <th scope="col" className={styles.colNum}>Monthly (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.rows.map((row) => (
                    <tr
                      key={`${row.category}-${row.component}`}
                      className={row.category === 'Final' ? styles.rowFinal : ''}
                    >
                      <td>{row.category}</td>
                      <td>{row.component}</td>
                      <td className={styles.colNum}>{formatInr(row.monthly)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {snapshot.npsGovtMonthly != null && (
              <p className={styles.govtNote}>
                <strong>Government benefit:</strong> employer NPS Tier-I is about {formatInr(snapshot.npsGovtMonthly)} per month
                (14% of Basic+DA). It is not deducted from cash in hand.
              </p>
            )}

            {snapshot.meta?.noteCtc && employmentType === 'private' && (
              <p className={styles.govtNote}>{snapshot.meta.noteCtc}</p>
            )}

            <div className={styles.trust}>
              <strong>Trust &amp; sources.</strong>{' '}
              Constants follow Union Budget {TAX_CONFIG.BUDGET_YEAR} orientation for FY {TAX_CONFIG.FY} (AY {TAX_CONFIG.AY}).
              Last reviewed in config: {TAX_CONFIG.LAST_VERIFIED}. For filing, use the official Income Tax portal.
            </div>

            <p className={styles.disclaimer}>
              Planning estimate only — not tax advice. State government pay can differ by rules; we use the same CPC-style
              DA/HRA/TA model as central for illustration. Surcharge applies at very high incomes.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
