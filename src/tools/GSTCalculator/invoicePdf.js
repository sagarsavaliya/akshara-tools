import { DEFAULT_INVOICE_PDF_TOGGLES } from '../../config/invoicePdfToggles.js'

function formatInr2(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0.00'
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function safeFilenamePart(s) {
  return String(s || 'Buyer')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'Buyer'
}

function isoDate(d) {
  const x = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(x.getTime())) return new Date().toISOString().slice(0, 10)
  return x.toISOString().slice(0, 10)
}

const PRIMARY = [26, 86, 219]

function mergeToggles(t) {
  return { ...DEFAULT_INVOICE_PDF_TOGGLES, ...(t && typeof t === 'object' ? t : {}) }
}

function drawPoweredFooter(doc) {
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  const n = doc.getNumberOfPages()
  for (let i = 1; i <= n; i += 1) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(75, 85, 99)
    doc.setFont('helvetica', 'normal')
    doc.text('Powered by Akshara Technologies.', w / 2, h - 14, { align: 'center' })
  }
}

/**
 * Build line-item table head + body for autoTable from toggles.
 */
function buildLineTable(lineRows, isIntra, toggles) {
  const headCells = []
  const pick = (show, header, cell) => {
    if (!show) return
    headCells.push({ header, cell })
  }

  pick(toggles.showLineDescription !== false, 'Description', (r) => r.desc || '—')
  pick(toggles.showLineHsn, 'HSN/SAC', (r) => r.hsn || '—')
  pick(toggles.showLineQty !== false, 'Qty', (r) => String(r.qty ?? ''))
  pick(toggles.showLineUnit, 'Unit', (r) => r.unit || '—')
  pick(true, 'Rate (₹)', (r) => formatInr2(r.rate))
  pick(toggles.showLineGstPercent, 'GST %', (r) => `${r.gstPct ?? 0}%`)
  pick(toggles.showLineTaxable, 'Taxable', (r) => formatInr2(r.taxable))

  const useSplit = isIntra && toggles.showLineCgstSgstSplit
  if (useSplit) {
    pick(true, 'CGST', (r) => formatInr2(r.cgst))
    pick(true, 'SGST', (r) => formatInr2(r.sgst))
  } else if (toggles.showLineGstAmount) {
    if (isIntra) {
      pick(true, 'GST', (r) => formatInr2(r.gst))
    } else if (toggles.showLineIgstColumn) {
      pick(true, 'IGST', (r) => formatInr2(r.igst))
    } else {
      pick(true, 'GST', (r) => formatInr2(r.igst))
    }
  }

  pick(toggles.showLineCess, 'Cess', (r) => formatInr2(r.cess))
  pick(toggles.showLineTotal, 'Total', (r) => formatInr2(r.total))

  if (headCells.length === 0) {
    return {
      head: [['Description', 'Taxable (₹)', 'Total (₹)']],
      body: lineRows.map((r) => [r.desc || '—', formatInr2(r.taxable), formatInr2(r.total)]),
      colCount: 3,
    }
  }

  const head = [headCells.map((c) => c.header)]
  const body = lineRows.map((r) => headCells.map((c) => c.cell(r)))

  return { head, body, colCount: headCells.length }
}

/**
 * Tab 1 — GST summary PDF (lazy-loaded jspdf).
 */
export async function downloadGstCalculationPdf(payload) {
  const { jsPDF } = await import('jspdf')
  const { basis, supply, ratePct, amountLabel, snap } = payload
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()

  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, pageW, 42, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text('GST calculation summary', 40, 28)

  doc.setTextColor(30, 30, 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  let y = 58
  const lines = [
    `Amount (${amountLabel}): ₹${formatInr2(snap.amountInput)}`,
    `Basis: ${basis === 'exclusive' ? 'Exclusive of GST' : 'Inclusive of GST'}`,
    `Supply: ${supply === 'intra' ? 'Intra-state (CGST + SGST)' : 'Inter-state (IGST)'}`,
    `Rate: ${ratePct}%`,
    '',
    `Taxable value: ₹${formatInr2(snap.taxableValue)}`,
    supply === 'intra'
      ? `CGST: ₹${formatInr2(snap.cgst)}    SGST: ₹${formatInr2(snap.sgst)}`
      : `IGST: ₹${formatInr2(snap.igst)}`,
    `Total GST: ₹${formatInr2(snap.gstAmount)}`,
    `Invoice total: ₹${formatInr2(snap.invoiceTotal)}`,
    '',
    'Generated on device — Akshara Tools (planning only; not tax advice).',
  ]
  lines.forEach((line) => {
    doc.text(line, 40, y)
    y += line === '' ? 8 : 14
  })

  drawPoweredFooter(doc)
  doc.save(`GST_Summary_${isoDate(new Date())}.pdf`)
}

function addWrappedBlock(doc, text, x, yStart, maxW, lineHeight) {
  if (!text?.trim()) return yStart
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(40, 40, 40)
  const lines = doc.splitTextToSize(text.trim(), maxW)
  let y = yStart
  lines.forEach((ln) => {
    doc.text(ln, x, y)
    y += lineHeight
  })
  return y + 4
}

/**
 * Tab 2 — full invoice (jspdf + autotable, dynamic import).
 */
export async function downloadGstInvoicePdf(data) {
  const [{ jsPDF }, autotableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autotableMod.default

  const toggles = mergeToggles(data.toggles)
  const {
    seller,
    buyer,
    meta,
    lineRows,
    totals,
    amountInWords,
    logoDataUrl,
    isIntra,
    categoryLabel = '',
    signatoryName = '',
    signatoryTitle = '',
    terms = '',
    notes = '',
  } = data

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const headerH = toggles.showBusinessCategory && categoryLabel ? 52 : 44

  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, pageW, headerH, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Tax Invoice', 40, 28)
  if (toggles.showBusinessCategory && categoryLabel) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const sub = doc.splitTextToSize(categoryLabel, pageW - 160)
    doc.text(sub, 40, 40)
  }

  if (toggles.showLogo && logoDataUrl && /^data:image\//i.test(logoDataUrl)) {
    try {
      const fmt = logoDataUrl.includes('image/png') ? 'PNG' : 'JPEG'
      doc.addImage(logoDataUrl, fmt, pageW - 120, 10, 72, 28)
    } catch {
      /* ignore */
    }
  }

  doc.setTextColor(20, 20, 20)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  const blockTop = headerH + 14
  const sellerLines = []
  if (toggles.showSeller) {
    if (seller.businessName) sellerLines.push(seller.businessName)
    if (toggles.showSellerGstin && seller.gstin) sellerLines.push(`GSTIN: ${seller.gstin}`)
    if (toggles.showSellerAddress) {
      if (seller.address) sellerLines.push(seller.address)
      const cityLine = `${seller.city || ''}${seller.city && seller.state ? ', ' : ''}${seller.state || ''} ${seller.pin || ''}`.trim()
      if (cityLine) sellerLines.push(cityLine)
    }
    if (toggles.showSellerContact) {
      const c = [seller.phone, seller.email].filter(Boolean).join(' · ')
      if (c) sellerLines.push(c)
    }
    if (sellerLines.length === 0) sellerLines.push('—')
  }

  const metaLines = []
  if (toggles.showInvoiceNumber) metaLines.push(`No: ${meta.invoiceNo || '—'}`)
  if (toggles.showInvoiceDate) metaLines.push(`Date: ${meta.date || '—'}`)
  if (toggles.showDueDate) metaLines.push(`Due: ${meta.dueDate || '—'}`)
  if (toggles.showPlaceOfSupply) metaLines.push(`Place of supply: ${meta.placeOfSupply || '—'}`)

  const metaX = pageW / 2 + 20
  let sellerBottom = blockTop
  if (sellerLines.length) {
    doc.setFont('helvetica', 'bold')
    doc.text('Seller', 40, blockTop)
    doc.setFont('helvetica', 'normal')
    sellerLines.forEach((ln, i) => {
      doc.text(ln, 40, blockTop + 12 + i * 11, { maxWidth: pageW / 2 - 50 })
    })
    sellerBottom = blockTop + 12 + sellerLines.length * 11
  }

  let metaBottom = blockTop
  if (metaLines.length) {
    doc.setFont('helvetica', 'bold')
    doc.text('Invoice details', metaX, blockTop)
    doc.setFont('helvetica', 'normal')
    metaLines.forEach((ln, i) => {
      doc.text(ln, metaX, blockTop + 12 + i * 11)
    })
    metaBottom = blockTop + 12 + metaLines.length * 11
  }

  let cursorY = Math.max(sellerBottom, metaBottom, blockTop) + 14

  if (toggles.showBuyer) {
    doc.setFont('helvetica', 'bold')
    doc.text('Buyer', 40, cursorY)
    doc.setFont('helvetica', 'normal')
    const buyerLines = []
    if (buyer.name) buyerLines.push(buyer.name)
    if (toggles.showBuyerGstin && buyer.gstin) buyerLines.push(`GSTIN: ${buyer.gstin}`)
    if (toggles.showBuyerAddress) {
      if (buyer.address) buyerLines.push(buyer.address)
      const bCity = `${buyer.city || ''}${buyer.city && buyer.state ? ', ' : ''}${buyer.state || ''} ${buyer.pin || ''}`.trim()
      if (bCity) buyerLines.push(bCity)
    }
    if (buyerLines.length === 0) buyerLines.push('—')
    buyerLines.forEach((ln, i) => {
      doc.text(ln, 40, cursorY + 12 + i * 11, { maxWidth: pageW - 80 })
    })
    cursorY += 12 + Math.max(buyerLines.length, 1) * 11 + 14
  }

  if (toggles.showBankBlock && (seller.bankAccount || seller.ifsc || seller.bankName)) {
    doc.setFont('helvetica', 'bold')
    doc.text('Bank details', 40, cursorY)
    doc.setFont('helvetica', 'normal')
    const bankY = cursorY + 12
    doc.text(
      [seller.bankName, seller.branch, seller.accountNo ? `A/c: ${seller.accountNo}` : '', seller.ifsc ? `IFSC: ${seller.ifsc}` : '']
        .filter(Boolean)
        .join(' · '),
      40,
      bankY,
      { maxWidth: pageW - 80 },
    )
    cursorY = bankY + 22
  }

  const { head, body, colCount } = buildLineTable(lineRows, isIntra, toggles)
  const fs = colCount > 9 ? 6.5 : 7.5

  autoTable(doc, {
    startY: cursorY,
    head,
    body,
    theme: 'plain',
    styles: { fontSize: fs, cellPadding: 3, textColor: [30, 30, 30], overflow: 'linebreak' },
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: 'bold' },
    margin: { left: 40, right: 40, bottom: 36 },
  })

  let afterTable = doc.lastAutoTable.finalY + 12

  const footRows = []
  if (toggles.showTotalsTaxable) {
    footRows.push(['Taxable amount', `₹${formatInr2(totals.subtotalTaxable)}`])
  }
  if (toggles.showTotalsCgst) {
    footRows.push(['Total CGST', `₹${formatInr2(totals.totalCgst)}`])
  }
  if (toggles.showTotalsSgst) {
    footRows.push(['Total SGST', `₹${formatInr2(totals.totalSgst)}`])
  }
  if (toggles.showTotalsIgst) {
    footRows.push(['Total IGST', `₹${formatInr2(totals.totalIgst)}`])
  }
  if (toggles.showTotalsCess) {
    footRows.push(['Total cess', `₹${formatInr2(totals.totalCess)}`])
  }
  if (toggles.showDiscountRow) {
    footRows.push(['Discount', `₹${formatInr2(totals.discount)}`])
  }
  if (toggles.showGrandTotal) {
    footRows.push(['Grand total', `₹${formatInr2(totals.grandTotal)}`])
  }

  if (footRows.length) {
    autoTable(doc, {
      startY: afterTable,
      body: footRows,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: pageW - 260, right: 40, bottom: 36 },
      tableWidth: 220,
    })
    afterTable = doc.lastAutoTable.finalY + 10
  }

  let wy = afterTable
  if (toggles.showAmountInWords && amountInWords) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(30, 30, 30)
    const wLines = doc.splitTextToSize(amountInWords, pageW - 80)
    wLines.forEach((ln) => {
      doc.text(ln, 40, wy)
      wy += 12
    })
    wy += 8
  }

  if (toggles.showAuthorizedSignatory && (signatoryName || signatoryTitle)) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 30, 30)
    const forName = seller.businessName || 'Seller'
    doc.text(`For ${forName}`, 40, wy)
    wy += 14
    if (signatoryName) {
      doc.setFont('helvetica', 'bold')
      doc.text(signatoryName, 40, wy)
      wy += 12
    }
    doc.setFont('helvetica', 'normal')
    if (signatoryTitle) {
      doc.text(signatoryTitle, 40, wy)
      wy += 14
    }
    wy += 6
  }

  if (toggles.showTermsAndConditions && terms?.trim()) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Terms & conditions', 40, wy)
    wy += 12
    wy = addWrappedBlock(doc, terms, 40, wy, pageW - 80, 11)
  }

  if (toggles.showNotes && notes?.trim()) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(30, 30, 30)
    doc.text('Notes', 40, wy)
    wy += 12
    wy = addWrappedBlock(doc, notes, 40, wy, pageW - 80, 11)
  }

  drawPoweredFooter(doc)

  const fname = `Invoice_${safeFilenamePart(meta.invoiceNo)}_${safeFilenamePart(buyer.name)}_${isoDate(meta.date)}.pdf`
  doc.save(fname)
}
