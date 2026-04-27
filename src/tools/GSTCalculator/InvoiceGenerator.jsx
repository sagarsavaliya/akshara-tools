import { useCallback, useEffect, useMemo, useState } from 'react'
import { GST_CONFIG, INDIAN_STATES } from '../../config/gstConfig.js'
import { INVOICE_BUSINESS_CATEGORIES, getInvoiceCategoryById } from '../../config/invoiceCategories.js'
import { DEFAULT_INVOICE_PDF_TOGGLES } from '../../config/invoicePdfToggles.js'
import { INVOICE_TOGGLE_GROUPS } from '../../config/invoiceToggleFieldMeta.js'
import { inrAmountToWords } from '../../utils/inrWords.js'
import { computeInvoiceTotals, grandTotalAfterDiscount } from './invoiceTotals.js'
import styles from './InvoiceGenerator.module.css'

function formatInr2(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '₹0.00'
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const emptyLine = () => ({
  desc: '',
  hsn: '',
  qty: 1,
  unit: 'Nos',
  rate: 0,
  gstPct: 18,
  cessPct: 0,
})

const initialSeller = () => ({
  businessName: '',
  gstin: '',
  address: '',
  city: '',
  state: '',
  pin: '',
  phone: '',
  email: '',
  bankAccount: '',
  ifsc: '',
  bankName: '',
  branch: '',
})

const initialBuyer = () => ({
  name: '',
  gstin: '',
  address: '',
  city: '',
  state: '',
  pin: '',
})

function loadSeller() {
  try {
    const raw = localStorage.getItem(GST_CONFIG.STORAGE_SELLER)
    if (!raw) return initialSeller()
    return { ...initialSeller(), ...JSON.parse(raw) }
  } catch {
    return initialSeller()
  }
}

function loadLogo() {
  try {
    return localStorage.getItem(GST_CONFIG.STORAGE_LOGO) || ''
  } catch {
    return ''
  }
}

function readInvoicePrefs() {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(GST_CONFIG.STORAGE_INVOICE_PREFS)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function nextInvoiceNo() {
  const last = Number(localStorage.getItem(GST_CONFIG.STORAGE_SEQ) || '0')
  return `INV-${String(last + 1).padStart(5, '0')}`
}

function bumpSeqFromNo(invoiceNo) {
  const m = /^INV-(\d+)$/i.exec(String(invoiceNo).trim())
  if (!m) return
  const n = Number.parseInt(m[1], 10)
  const prev = Number(localStorage.getItem(GST_CONFIG.STORAGE_SEQ) || '0')
  if (n > prev) localStorage.setItem(GST_CONFIG.STORAGE_SEQ, String(n))
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function dueDefault() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

export default function InvoiceGenerator() {
  const prefs = readInvoicePrefs()

  const [seller, setSeller] = useState(loadSeller)
  const [buyer, setBuyer] = useState(initialBuyer)
  const [meta, setMeta] = useState(() => ({
    invoiceNo: nextInvoiceNo(),
    date: todayIso(),
    dueDate: dueDefault(),
    placeOfSupply: '',
    businessCategoryId: prefs.businessCategoryId || 'general',
  }))
  const [lines, setLines] = useState([emptyLine()])
  const [discount, setDiscount] = useState(0)
  const [logoDataUrl, setLogoDataUrl] = useState(loadLogo)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [pdfErr, setPdfErr] = useState('')

  const [toggles, setToggles] = useState(() => ({
    ...DEFAULT_INVOICE_PDF_TOGGLES,
    ...(prefs.toggles && typeof prefs.toggles === 'object' ? prefs.toggles : {}),
  }))
  const [terms, setTerms] = useState(() => prefs.terms || '')
  const [notes, setNotes] = useState(() => prefs.notes || '')
  const [signatoryName, setSignatoryName] = useState(() => prefs.signatoryName || '')
  const [signatoryTitle, setSignatoryTitle] = useState(() => prefs.signatoryTitle || '')

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(GST_CONFIG.STORAGE_SELLER, JSON.stringify(seller))
      } catch {
        /* quota */
      }
    }, 400)
    return () => clearTimeout(t)
  }, [seller])

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(GST_CONFIG.STORAGE_INVOICE_PREFS, JSON.stringify({
          toggles,
          terms,
          notes,
          signatoryName,
          signatoryTitle,
          businessCategoryId: meta.businessCategoryId,
        }))
      } catch {
        /* quota */
      }
    }, 500)
    return () => clearTimeout(t)
  }, [toggles, terms, notes, signatoryName, signatoryTitle, meta.businessCategoryId])

  const isIntra = Boolean(
    seller.state
    && meta.placeOfSupply
    && seller.state === meta.placeOfSupply,
  )

  const {
    lineRows,
    subtotalTaxable,
    totalGst,
    totalCgst,
    totalSgst,
    totalIgst,
    totalCess,
  } = useMemo(
    () => computeInvoiceTotals(lines, isIntra),
    [lines, isIntra],
  )

  const grand = useMemo(
    () => grandTotalAfterDiscount(subtotalTaxable, totalGst, totalCess, discount),
    [subtotalTaxable, totalGst, totalCess, discount],
  )

  const words = useMemo(() => inrAmountToWords(grand), [grand])
  const categoryLabel = getInvoiceCategoryById(meta.businessCategoryId).label

  const setToggle = useCallback((key, value) => {
    setToggles((prev) => ({ ...prev, [key]: value }))
  }, [])

  const insertSampleTerms = useCallback(() => {
    const cat = getInvoiceCategoryById(meta.businessCategoryId)
    setTerms(cat.sampleTerms || '')
  }, [meta.businessCategoryId])

  const addLine = useCallback(() => {
    setLines((prev) => (prev.length >= GST_CONFIG.LINE_ITEMS_MAX ? prev : [...prev, emptyLine()]))
  }, [])

  const removeLine = useCallback((idx) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)))
  }, [])

  const patchLine = useCallback((idx, patch) => {
    setLines((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
  }, [])

  const onLogo = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result || '')
      setLogoDataUrl(url)
      try {
        localStorage.setItem(GST_CONFIG.STORAGE_LOGO, url)
      } catch {
        setPdfErr('Logo too large for browser storage; PDF will omit logo.')
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const clearLogo = useCallback(() => {
    setLogoDataUrl('')
    localStorage.removeItem(GST_CONFIG.STORAGE_LOGO)
  }, [])

  const onDownloadPdf = useCallback(async () => {
    setPdfErr('')
    setPdfBusy(true)
    try {
      const { downloadGstInvoicePdf } = await import('./invoicePdf.js')
      await downloadGstInvoicePdf({
        seller,
        buyer,
        meta,
        lineRows,
        totals: {
          subtotalTaxable,
          totalCgst,
          totalSgst,
          totalIgst,
          totalCess,
          discount,
          grandTotal: grand,
        },
        amountInWords: words,
        logoDataUrl,
        toggles,
        isIntra,
        categoryLabel,
        signatoryName,
        signatoryTitle,
        terms,
        notes,
      })
      bumpSeqFromNo(meta.invoiceNo)
    } catch (err) {
      setPdfErr(err?.message || 'Could not build PDF.')
    } finally {
      setPdfBusy(false)
    }
  }, [
    seller,
    buyer,
    meta,
    lineRows,
    subtotalTaxable,
    totalCgst,
    totalSgst,
    totalIgst,
    totalCess,
    discount,
    grand,
    words,
    logoDataUrl,
    toggles,
    isIntra,
    categoryLabel,
    signatoryName,
    signatoryTitle,
    terms,
    notes,
  ])

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.btn} onClick={onDownloadPdf} disabled={pdfBusy}>
          {pdfBusy ? 'Preparing PDF…' : 'Download PDF'}
        </button>
        <span className={styles.logoRow}>
          <label>
            Logo (stored locally):
            <input type="file" accept="image/png,image/jpeg" onChange={onLogo} style={{ marginLeft: '0.35rem' }} />
          </label>
          {logoDataUrl ? (
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={clearLogo}>
              Clear logo
            </button>
          ) : null}
        </span>
      </div>
      {pdfErr ? <p className={styles.err}>{pdfErr}</p> : null}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Business type</h2>
        <p className={styles.hintPara}>
          Choose an industry preset for the PDF subtitle. Use sample terms as a starting point, then edit.
        </p>
        <div className={styles.fieldGrid}>
          <div>
            <label className={styles.label} htmlFor="inv-category">Category</label>
            <select
              id="inv-category"
              className={styles.select}
              value={meta.businessCategoryId}
              onChange={(e) => setMeta((m) => ({ ...m, businessCategoryId: e.target.value }))}
            >
              {INVOICE_BUSINESS_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.alignEnd}>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={insertSampleTerms}>
              Insert sample terms for this category
            </button>
          </div>
        </div>
      </section>

      <details className={styles.details}>
        <summary className={styles.detailsSummary}>PDF — what to include (all optional)</summary>
        <div className={styles.toggleGroups}>
          {INVOICE_TOGGLE_GROUPS.map((group) => (
            <div key={group.title} className={styles.toggleGroup}>
              <p className={styles.toggleGroupTitle}>{group.title}</p>
              <div className={styles.toggleGrid}>
                {group.fields.map(([key, label]) => (
                  <label key={key} className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={Boolean(toggles[key])}
                      onChange={(e) => setToggle(key, e.target.checked)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>

      <div className={styles.grid2}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Seller (saved in this browser)</h2>
          <div className={styles.fieldGrid}>
            <div>
              <label className={styles.label} htmlFor="inv-seller-name">Business name</label>
              <input
                id="inv-seller-name"
                className={styles.input}
                value={seller.businessName}
                onChange={(e) => setSeller((s) => ({ ...s, businessName: e.target.value }))}
                autoComplete="organization"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-seller-gstin">GSTIN (15)</label>
              <input
                id="inv-seller-gstin"
                className={styles.input}
                value={seller.gstin}
                maxLength={15}
                onChange={(e) => setSeller((s) => ({ ...s, gstin: e.target.value.toUpperCase() }))}
                inputMode="text"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label} htmlFor="inv-seller-addr">Address</label>
              <input
                id="inv-seller-addr"
                className={styles.input}
                value={seller.address}
                onChange={(e) => setSeller((s) => ({ ...s, address: e.target.value }))}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-seller-city">City</label>
              <input
                id="inv-seller-city"
                className={styles.input}
                value={seller.city}
                onChange={(e) => setSeller((s) => ({ ...s, city: e.target.value }))}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-seller-state">State</label>
              <select
                id="inv-seller-state"
                className={styles.select}
                value={seller.state}
                onChange={(e) => setSeller((s) => ({ ...s, state: e.target.value }))}
              >
                <option value="">Select</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-seller-pin">PIN</label>
              <input
                id="inv-seller-pin"
                className={styles.input}
                value={seller.pin}
                onChange={(e) => setSeller((s) => ({ ...s, pin: e.target.value }))}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-seller-phone">Phone</label>
              <input
                id="inv-seller-phone"
                className={styles.input}
                value={seller.phone}
                onChange={(e) => setSeller((s) => ({ ...s, phone: e.target.value }))}
                inputMode="tel"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-seller-email">Email</label>
              <input
                id="inv-seller-email"
                className={styles.input}
                type="email"
                value={seller.email}
                onChange={(e) => setSeller((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-bank-ac">Account no. (optional)</label>
              <input
                id="inv-bank-ac"
                className={styles.input}
                value={seller.bankAccount}
                onChange={(e) => setSeller((s) => ({ ...s, bankAccount: e.target.value }))}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-bank-ifsc">IFSC (optional)</label>
              <input
                id="inv-bank-ifsc"
                className={styles.input}
                value={seller.ifsc}
                onChange={(e) => setSeller((s) => ({ ...s, ifsc: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-bank-name">Bank name</label>
              <input
                id="inv-bank-name"
                className={styles.input}
                value={seller.bankName}
                onChange={(e) => setSeller((s) => ({ ...s, bankName: e.target.value }))}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-bank-branch">Branch</label>
              <input
                id="inv-bank-branch"
                className={styles.input}
                value={seller.branch}
                onChange={(e) => setSeller((s) => ({ ...s, branch: e.target.value }))}
              />
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Buyer</h2>
          <div className={styles.fieldGrid}>
            <div>
              <label className={styles.label} htmlFor="inv-buyer-name">Name</label>
              <input
                id="inv-buyer-name"
                className={styles.input}
                value={buyer.name}
                onChange={(e) => setBuyer((b) => ({ ...b, name: e.target.value }))}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-buyer-gstin">GSTIN (optional)</label>
              <input
                id="inv-buyer-gstin"
                className={styles.input}
                maxLength={15}
                value={buyer.gstin}
                onChange={(e) => setBuyer((b) => ({ ...b, gstin: e.target.value.toUpperCase() }))}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label} htmlFor="inv-buyer-addr">Address</label>
              <input
                id="inv-buyer-addr"
                className={styles.input}
                value={buyer.address}
                onChange={(e) => setBuyer((b) => ({ ...b, address: e.target.value }))}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-buyer-city">City</label>
              <input
                id="inv-buyer-city"
                className={styles.input}
                value={buyer.city}
                onChange={(e) => setBuyer((b) => ({ ...b, city: e.target.value }))}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-buyer-state">State</label>
              <select
                id="inv-buyer-state"
                className={styles.select}
                value={buyer.state}
                onChange={(e) => setBuyer((b) => ({ ...b, state: e.target.value }))}
              >
                <option value="">Select</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label} htmlFor="inv-buyer-pin">PIN</label>
              <input
                id="inv-buyer-pin"
                className={styles.input}
                value={buyer.pin}
                onChange={(e) => setBuyer((b) => ({ ...b, pin: e.target.value }))}
                inputMode="numeric"
              />
            </div>
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Invoice meta</h2>
        <div className={styles.fieldGrid}>
          <div>
            <label className={styles.label} htmlFor="inv-no">Invoice no.</label>
            <input
              id="inv-no"
              className={styles.input}
              value={meta.invoiceNo}
              onChange={(e) => setMeta((m) => ({ ...m, invoiceNo: e.target.value }))}
            />
          </div>
          <div>
            <label className={styles.label} htmlFor="inv-date">Date</label>
            <input
              id="inv-date"
              type="date"
              className={styles.input}
              value={meta.date}
              onChange={(e) => setMeta((m) => ({ ...m, date: e.target.value }))}
            />
          </div>
          <div>
            <label className={styles.label} htmlFor="inv-due">Due date</label>
            <input
              id="inv-due"
              type="date"
              className={styles.input}
              value={meta.dueDate}
              onChange={(e) => setMeta((m) => ({ ...m, dueDate: e.target.value }))}
            />
          </div>
          <div>
            <label className={styles.label} htmlFor="inv-pos">Place of supply</label>
            <select
              id="inv-pos"
              className={styles.select}
              value={meta.placeOfSupply}
              onChange={(e) => setMeta((m) => ({ ...m, placeOfSupply: e.target.value }))}
            >
              <option value="">Select</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.label} htmlFor="inv-discount">Discount (₹)</label>
            <input
              id="inv-discount"
              className={styles.input}
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            />
          </div>
        </div>
        <p className={styles.hintPara}>
          IGST applies when place of supply differs from seller state; same state uses CGST + SGST per line.
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Line items (max {GST_CONFIG.LINE_ITEMS_MAX})</h2>
        <div className={styles.tableScroll}>
          <table className={styles.linesTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>HSN/SAC</th>
                <th className={styles.num}>Qty</th>
                <th>Unit</th>
                <th className={styles.num}>Rate (₹)</th>
                <th className={styles.num}>GST %</th>
                <th className={styles.num}>Cess %</th>
                <th className={styles.num}>Taxable</th>
                <th className={styles.num}>GST</th>
                <th className={styles.num}>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => {
                const comp = lineRows[idx]
                return (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <input
                        className={styles.input}
                        value={line.desc}
                        onChange={(e) => patchLine(idx, { desc: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.input}
                        value={line.hsn}
                        onChange={(e) => patchLine(idx, { hsn: e.target.value })}
                      />
                    </td>
                    <td className={styles.num}>
                      <input
                        className={styles.input}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={line.qty}
                        onChange={(e) => patchLine(idx, { qty: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.input}
                        value={line.unit}
                        onChange={(e) => patchLine(idx, { unit: e.target.value })}
                      />
                    </td>
                    <td className={styles.num}>
                      <input
                        className={styles.input}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.01}
                        value={line.rate}
                        onChange={(e) => patchLine(idx, { rate: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td className={styles.num}>
                      <input
                        className={styles.input}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={1}
                        value={line.gstPct}
                        onChange={(e) => patchLine(idx, { gstPct: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td className={styles.num}>
                      <input
                        className={styles.input}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={0.01}
                        value={line.cessPct}
                        onChange={(e) => patchLine(idx, { cessPct: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td className={styles.num}>{formatInr2(comp?.taxable ?? 0)}</td>
                    <td className={styles.num}>{formatInr2(comp?.gst ?? 0)}</td>
                    <td className={styles.num}>{formatInr2(comp?.total ?? 0)}</td>
                    <td>
                      <button type="button" className={styles.rowBtn} onClick={() => removeLine(idx)} aria-label="Remove row">
                        ✕
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          style={{ marginTop: '0.65rem' }}
          onClick={addLine}
          disabled={lines.length >= GST_CONFIG.LINE_ITEMS_MAX}
        >
          Add row
        </button>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Authorized signatory &amp; legal text</h2>
        <div className={styles.fieldGrid}>
          <div>
            <label className={styles.label} htmlFor="inv-sign-name">Signatory name</label>
            <input
              id="inv-sign-name"
              className={styles.input}
              value={signatoryName}
              onChange={(e) => setSignatoryName(e.target.value)}
            />
          </div>
          <div>
            <label className={styles.label} htmlFor="inv-sign-title">Designation / title</label>
            <input
              id="inv-sign-title"
              className={styles.input}
              value={signatoryTitle}
              onChange={(e) => setSignatoryTitle(e.target.value)}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label} htmlFor="inv-terms">Terms &amp; conditions</label>
            <textarea
              id="inv-terms"
              className={styles.textarea}
              rows={4}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Payment, returns, jurisdiction, etc."
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label} htmlFor="inv-notes">Notes</label>
            <textarea
              id="inv-notes"
              className={styles.textarea}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional remarks on the invoice"
            />
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Totals</h2>
        <div className={styles.totals}>
          <div className={styles.totalsRow}>
            <span>Subtotal (taxable)</span>
            <span>{formatInr2(subtotalTaxable)}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Total CGST</span>
            <span>{formatInr2(totalCgst)}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Total SGST</span>
            <span>{formatInr2(totalSgst)}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Total IGST</span>
            <span>{formatInr2(totalIgst)}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Total cess</span>
            <span>{formatInr2(totalCess)}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Discount</span>
            <span>{formatInr2(discount)}</span>
          </div>
          <div className={styles.totalsRow} style={{ fontWeight: 700 }}>
            <span>Grand total</span>
            <span>{formatInr2(grand)}</span>
          </div>
        </div>
        <p className={styles.words}>{words}</p>
      </section>
    </div>
  )
}
