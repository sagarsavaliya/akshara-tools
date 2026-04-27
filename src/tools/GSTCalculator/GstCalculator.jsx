import { useCallback, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { GST_CONFIG } from '../../config/gstConfig.js'
import { appMeta } from '../../config/appConfig.js'
import { computeGst } from './gstEngine.js'
import InvoiceGenerator from './InvoiceGenerator.jsx'
import styles from './GstCalculator.module.css'

function formatInr2(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '₹0.00'
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const CANONICAL = `https://${appMeta.domain}/gst-calculator`

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the difference between CGST, SGST, and IGST?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For intra-state supplies, GST is split equally into CGST (Centre) and SGST (State). For inter-state supplies, IGST applies and is collected by the Centre, with settlement mechanisms between states.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I calculate GST on a price?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If the price is exclusive of GST, multiply the taxable value by the GST rate and add it to get the invoice total. This tool uses headline slabs (0%, 5%, 12%, 18%, 28%) with two-decimal rupee rounding per common invoice practice.',
      },
    },
    {
      '@type': 'Question',
      name: 'How to extract GST from an inclusive price?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Choose “Inclusive of GST”, enter the total payable, and select the rate. The calculator backs out taxable value and GST using the same rounding rules as in the PRD formulas.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the current GST rates in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Common headline slabs are 0%, 5%, 12%, 18%, and 28%. Specific goods and services may differ; always verify on the official GST portal or with a qualified adviser before filing.',
      },
    },
    {
      '@type': 'Question',
      name: 'How to generate a GST invoice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Open the Invoice Generator tab, fill seller and buyer details, line items, and place of supply, then download the PDF. Seller details persist locally in your browser; nothing is uploaded to a server.',
      },
    },
  ],
}

export default function GstCalculator() {
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = location.hash === '#invoice' ? 'invoice' : 'calc'

  const goCalc = useCallback(() => {
    navigate('/gst-calculator', { replace: true })
  }, [navigate])

  const goInvoice = useCallback(() => {
    navigate('/gst-calculator#invoice', { replace: true })
  }, [navigate])
  const [basis, setBasis] = useState('exclusive')
  const [supply, setSupply] = useState('intra')
  const [ratePct, setRatePct] = useState(18)
  const [amount, setAmount] = useState(100_000)
  const [copyMsg, setCopyMsg] = useState('')
  const [pdfBusy, setPdfBusy] = useState(false)

  const rawRateIdx = GST_CONFIG.RATE_OPTIONS.findIndex((o) => o.value === ratePct)
  const rateIdx = rawRateIdx >= 0 ? rawRateIdx : 3

  const snap = useMemo(
    () => computeGst({ basis, supply, ratePct, amount }),
    [basis, supply, ratePct, amount],
  )

  const basisLabel = snap.basis === 'exclusive' ? 'Exclusive of GST' : 'Inclusive of GST'
  const supplyLabel = snap.supply === 'intra' ? 'Intra-state (CGST + SGST)' : 'Inter-state (IGST)'

  const splitLine1 = snap.supply === 'intra'
    ? `CGST ${formatInr2(snap.cgst)}`
    : `IGST ${formatInr2(snap.igst)}`
  const splitLine2 = snap.supply === 'intra'
    ? `SGST ${formatInr2(snap.sgst)}`
    : 'Full GST to Centre (IGST model)'

  const rows = snap.supply === 'intra'
    ? [
      { label: 'Taxable value', value: formatInr2(snap.taxableValue) },
      { label: 'CGST', value: formatInr2(snap.cgst) },
      { label: 'SGST', value: formatInr2(snap.sgst) },
      { label: 'Total GST', value: formatInr2(snap.gstAmount) },
      { label: 'Invoice total', value: formatInr2(snap.invoiceTotal) },
    ]
    : [
      { label: 'Taxable value', value: formatInr2(snap.taxableValue) },
      { label: 'IGST', value: formatInr2(snap.igst) },
      { label: 'Invoice total', value: formatInr2(snap.invoiceTotal) },
    ]

  const amountLabel = basis === 'exclusive' ? 'Taxable value (₹)' : 'Invoice total (₹)'

  const copyAll = useCallback(async () => {
    setCopyMsg('')
    const half = snap.supply === 'intra' ? snap.ratePct / 2 : null
    const lines = [
      'GST Calculator — Akshara Tools',
      '',
      `${amountLabel}: ${formatInr2(snap.amountInput)}`,
      `Amount type: ${basisLabel}`,
      `GST rate: ${snap.ratePct}%`,
      `Transaction type: ${supplyLabel}`,
      '',
      `Base amount (taxable value): ${formatInr2(snap.taxableValue)}`,
      snap.supply === 'intra'
        ? `CGST (${half}%): ${formatInr2(snap.cgst)}`
        : `IGST (${snap.ratePct}%): ${formatInr2(snap.igst)}`,
      snap.supply === 'intra' ? `SGST (${half}%): ${formatInr2(snap.sgst)}` : '',
      '────────────────',
      `Total: ${formatInr2(snap.invoiceTotal)}`,
    ].filter(Boolean).join('\n')
    try {
      await navigator.clipboard.writeText(lines)
      setCopyMsg('Copied.')
      setTimeout(() => setCopyMsg(''), 2000)
    } catch {
      setCopyMsg('Copy blocked by browser.')
    }
  }, [snap, basisLabel, supplyLabel, amountLabel])

  const downloadCalcPdf = useCallback(async () => {
    setPdfBusy(true)
    try {
      const { downloadGstCalculationPdf } = await import('./invoicePdf.js')
      await downloadGstCalculationPdf({
        basis,
        supply,
        ratePct,
        amountLabel,
        snap,
      })
    } finally {
      setPdfBusy(false)
    }
  }, [basis, supply, ratePct, amountLabel, snap])

  return (
    <>
      <Helmet>
        <title>GST Calculator &amp; Invoice Generator | CGST SGST IGST Split — Free 2025 | Akshara Tools</title>
        <meta
          name="description"
          content="Calculate GST instantly for any amount. Generate professional GST invoices with PDF download. CGST, SGST, IGST split. Free, no signup."
        />
        <meta
          name="keywords"
          content="gst calculator, gst invoice generator online free, cgst sgst calculator, gst inclusive exclusive calculator, gst invoice format india"
        />
        <link rel="canonical" href={CANONICAL} />
        <script type="application/ld+json">{JSON.stringify(FAQ_JSON_LD)}</script>
      </Helmet>

      <div className={styles.toolPage}>
        <header className={styles.toolHeader}>
          <div className={styles.toolMeta}>
            <span className={styles.eyebrow}>Indirect tax</span>
            <span className={styles.fyChip}>Model {GST_CONFIG.LAST_VERIFIED}</span>
          </div>

          <nav className={styles.tabBar} aria-label="GST page sections">
            <p className={styles.tabBarLabel}>Choose mode</p>
            <div className={styles.tabRow} role="tablist">
              <button
                type="button"
                role="tab"
                id="gst-tab-calc"
                aria-controls="gst-panel-calc"
                aria-selected={activeTab === 'calc'}
                className={activeTab === 'calc' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
                onClick={goCalc}
              >
                GST Calculator
              </button>
              <button
                type="button"
                role="tab"
                id="gst-tab-invoice"
                aria-controls="gst-panel-invoice"
                aria-selected={activeTab === 'invoice'}
                className={activeTab === 'invoice' ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
                onClick={goInvoice}
              >
                Invoice generator &amp; PDF
              </button>
            </div>
          </nav>

          <h1 className={styles.title}>GST Calculator — Instant CGST, SGST &amp; IGST Split</h1>
          <p className={styles.lede}>
            Quick GST split for planning, or a configurable invoice with logo, line items, cess, and download.
            {' '}
            <button type="button" className={styles.ledeCta} onClick={goInvoice}>
              Create GST invoice →
            </button>
          </p>
        </header>

        {activeTab === 'calc' ? (
          <div className={styles.layout} id="gst-panel-calc" role="tabpanel" aria-labelledby="gst-tab-calc">
            <aside className={styles.panel}>
              <p className={styles.panelTitle}>Inputs</p>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="gst-amount">
                  {amountLabel}
                </label>
                <input
                  id="gst-amount"
                  className={styles.field}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                />
                <p className={styles.hint}>
                  {basis === 'exclusive'
                    ? 'Amount before GST is added.'
                    : 'Total payable including GST; we back out taxable value.'}
                </p>
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.label} id="gst-basis-label">Amount type</span>
                <div className={styles.segmentRow} role="group" aria-labelledby="gst-basis-label">
                  <button
                    type="button"
                    className={basis === 'exclusive' ? `${styles.segmentBtn} ${styles.segmentBtnActive}` : styles.segmentBtn}
                    onClick={() => setBasis('exclusive')}
                  >
                    Exclusive
                  </button>
                  <button
                    type="button"
                    className={basis === 'inclusive' ? `${styles.segmentBtn} ${styles.segmentBtnActive}` : styles.segmentBtn}
                    onClick={() => setBasis('inclusive')}
                  >
                    Inclusive
                  </button>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.label} id="gst-rate-label">GST rate</span>
                <div className={styles.rateChipRow} role="group" aria-labelledby="gst-rate-label">
                  {GST_CONFIG.RATE_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      className={ratePct === o.value ? `${styles.rateChip} ${styles.rateChipActive}` : styles.rateChip}
                      onClick={() => setRatePct(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <div className={styles.sliderWrap}>
                  <input
                    type="range"
                    className={styles.rateSlider}
                    min={0}
                    max={GST_CONFIG.RATE_OPTIONS.length - 1}
                    step={1}
                    value={rateIdx >= 0 ? rateIdx : 0}
                    onChange={(e) => {
                      const i = Number(e.target.value)
                      const opt = GST_CONFIG.RATE_OPTIONS[i]
                      if (opt) setRatePct(opt.value)
                    }}
                    aria-valuetext={`${ratePct}%`}
                  />
                  <span className={styles.sliderReadout}>{ratePct}%</span>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <span className={styles.label} id="gst-supply-label">Transaction type</span>
                <div className={styles.segmentRow} role="group" aria-labelledby="gst-supply-label">
                  <button
                    type="button"
                    className={supply === 'intra' ? `${styles.segmentBtn} ${styles.segmentBtnActive}` : styles.segmentBtn}
                    onClick={() => setSupply('intra')}
                  >
                    Intra-state
                  </button>
                  <button
                    type="button"
                    className={supply === 'inter' ? `${styles.segmentBtn} ${styles.segmentBtnActive}` : styles.segmentBtn}
                    onClick={() => setSupply('inter')}
                  >
                    Inter-state
                  </button>
                </div>
              </div>

              <div className={styles.invoicePanel}>
                <p className={styles.invoicePanelTitle}>GST tax invoice</p>
                <p className={styles.invoicePanelText}>
                  Seller, buyer, HSN, cess, terms, optional logo — then download PDF (client-side only).
                </p>
                <button type="button" className={styles.invoicePanelBtn} onClick={goInvoice}>
                  Open invoice generator
                </button>
              </div>
            </aside>

            <section className={styles.results}>
              <div className={styles.resultToolbar}>
                <span className={styles.rateBadge}>{snap.ratePct}% GST applied</span>
                <div className={styles.resultActions}>
                  <button type="button" className={styles.actionBtn} onClick={copyAll}>
                    Copy all
                  </button>
                  <button type="button" className={styles.actionBtn} onClick={downloadCalcPdf} disabled={pdfBusy}>
                    {pdfBusy ? 'PDF…' : 'Download PDF'}
                  </button>
                  <button type="button" className={styles.actionBtnPrimary} onClick={goInvoice}>
                    Full invoice
                  </button>
                </div>
              </div>
              {copyMsg ? <p className={styles.copyToast}>{copyMsg}</p> : null}

              <div className={styles.summaryRow}>
                <div className={styles.hero}>
                  <p className={styles.heroLabel}>Invoice total</p>
                  <p className={styles.heroValue}>
                    {formatInr2(snap.invoiceTotal)}
                  </p>
                  <div className={styles.heroNotes}>
                    <p className={styles.heroNoteLine}>
                      Taxable value: <strong>{formatInr2(snap.taxableValue)}</strong>
                    </p>
                    <p className={styles.heroNoteLine}>
                      Total GST @ {snap.ratePct}%: <strong>{formatInr2(snap.gstAmount)}</strong>
                    </p>
                  </div>
                </div>
                <div className={styles.compareCard}>
                  <p className={styles.compareTitle}>Taxable value</p>
                  <p className={styles.compareValue}>{formatInr2(snap.taxableValue)}</p>
                  <div className={styles.compareMetaStack}>
                    <p className={styles.compareMetaLine}>{basisLabel}</p>
                    <p className={styles.compareMetaLine}>{supplyLabel}</p>
                  </div>
                </div>
                <div className={styles.compareCard}>
                  <p className={styles.compareTitle}>GST split</p>
                  <p className={styles.compareValue}>{formatInr2(snap.gstAmount)}</p>
                  <div className={styles.compareMetaStack}>
                    <p className={styles.compareMetaLine}>{splitLine1}</p>
                    <p className={styles.compareMetaLine}>{splitLine2}</p>
                  </div>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <p className={styles.tableTitle}>Invoice line preview</p>
                <table className={styles.breakdownTable}>
                  <thead>
                    <tr>
                      <th scope="col">Particular</th>
                      <th scope="col" className={styles.colNum}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label}>
                        <td>{row.label}</td>
                        <td className={styles.colNum}>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.trust}>
                <strong>Sources.</strong>{' '}
                Rates list follows common headline slabs for planning. Last reviewed in config: {GST_CONFIG.LAST_VERIFIED}.
                For returns and e-invoicing, use the official GST portal.
              </div>
              <p className={styles.disclaimer}>
                Planning estimate only — not tax advice. Composition, reverse charge, and exempt supplies are not modelled here.
              </p>
              <p className={styles.crossLink}>
                You might also use{' '}
                <Link to="/salary-calculator">Salary Calculator</Link>.
              </p>
            </section>
          </div>
        ) : (
          <div id="gst-panel-invoice" role="tabpanel" aria-labelledby="gst-tab-invoice">
            <button type="button" className={styles.backToCalc} onClick={goCalc}>
              ← Back to GST calculator
            </button>
            <InvoiceGenerator />
          </div>
        )}
      </div>
    </>
  )
}
