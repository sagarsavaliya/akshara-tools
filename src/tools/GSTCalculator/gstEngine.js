/**
 * GST computation per PRD Section 8.3 (intra CGST+SGST paise split, inclusive base).
 */

function clampNonNegative(n) {
  const x = Number(n)
  if (!Number.isFinite(x) || x < 0) return 0
  return x
}

/** Two-decimal rupees (display / line totals). */
export function round2(n) {
  return Math.round(Number(n) * 100) / 100
}

/**
 * @param {object} input
 * @param {'exclusive'|'inclusive'} input.basis
 * @param {'intra'|'inter'} input.supply
 * @param {number} input.ratePct — slab % (0, 5, 12, 18, 28)
 * @param {number} input.amount — rupees
 */
export function computeGst(input = {}) {
  const basis = input.basis === 'inclusive' ? 'inclusive' : 'exclusive'
  const supply = input.supply === 'inter' ? 'inter' : 'intra'
  const ratePct = clampNonNegative(input.ratePct)
  const rate = ratePct / 100
  const rawAmount = clampNonNegative(input.amount)

  let taxableValue
  let gstAmount
  let invoiceTotal

  if (basis === 'exclusive') {
    taxableValue = round2(rawAmount)
    gstAmount = Math.round(taxableValue * rate * 100) / 100
    invoiceTotal = round2(taxableValue + gstAmount)
  } else {
    invoiceTotal = round2(rawAmount)
    taxableValue = Math.round((invoiceTotal / (1 + rate)) * 100) / 100
    gstAmount = Math.round((invoiceTotal - taxableValue) * 100) / 100
  }

  let cgst = 0
  let sgst = 0
  let igst = 0

  if (supply === 'intra') {
    cgst = Math.floor(gstAmount * 100 / 2) / 100
    sgst = Math.floor(gstAmount * 100 / 2) / 100
    if (cgst + sgst < gstAmount) {
      sgst = round2(sgst + (gstAmount - (cgst + sgst)))
    }
  } else {
    igst = gstAmount
  }

  return {
    basis,
    supply,
    ratePct,
    amountInput: rawAmount,
    taxableValue,
    gstAmount,
    cgst,
    sgst,
    igst,
    invoiceTotal,
  }
}
