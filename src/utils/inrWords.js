/**
 * Indian numbering — rupees + paise (PRD Section 8.4).
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

/** 1–99 with hyphen for 21–99 composites (e.g. Fifty-Three). */
export function under100(n) {
  const x = Math.floor(Number(n))
  if (x <= 0) return ''
  if (x < 20) return ONES[x]
  const t = Math.floor(x / 10)
  const o = x % 10
  if (o === 0) return TENS[t]
  return `${TENS[t]}-${ONES[o]}`
}

/** 1–999 → words; zero → ''. */
export function wordsBelow1000(n) {
  const x = Math.floor(Number(n))
  if (x <= 0) return ''
  const h = Math.floor(x / 100)
  const r = x % 100
  if (h === 0) return under100(r)
  const head = `${ONES[h]} Hundred`
  if (r === 0) return head
  return `${head} and ${under100(r)}`
}

function chunkLabel(count, singular, plural) {
  if (count <= 0) return ''
  const w = wordsBelow1000(count)
  return `${w} ${count > 1 ? plural : singular}`
}

/** Integer rupees ≥ 0 → words (no "Rupees" prefix). */
export function rupeesCoreWords(rupeesInt) {
  let n = Math.floor(Math.max(0, Number(rupeesInt) || 0))
  if (n === 0) return 'Zero'

  const crore = Math.floor(n / 1_00_00_000)
  n %= 1_00_00_000
  const lakh = Math.floor(n / 1_00_000)
  n %= 1_00_000
  const thousand = Math.floor(n / 1000)
  const rem = n % 1000

  const parts = []
  if (crore > 0) parts.push(chunkLabel(crore, 'Crore', 'Crores'))
  if (lakh > 0) parts.push(chunkLabel(lakh, 'Lakh', 'Lakhs'))
  if (thousand > 0) parts.push(`${wordsBelow1000(thousand)} Thousand`)
  if (rem > 0) parts.push(wordsBelow1000(rem))

  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

function paiseWords(paiseInt) {
  const p = Math.min(99, Math.max(0, Math.round(Number(paiseInt) || 0)))
  if (p === 0) return ''
  return under100(p)
}

/**
 * @param {number} amountInRupees
 * @returns {string}
 */
export function inrAmountToWords(amountInRupees) {
  const amt = Number(amountInRupees)
  if (!Number.isFinite(amt) || amt < 0) return 'Rupees Zero Only'

  const rupees = Math.floor(amt + 1e-9)
  const paise = Math.round((amt - rupees) * 100)

  const rWords = rupeesCoreWords(rupees)
  const pStr = paiseWords(paise)

  if (rupees === 0 && paise === 0) return 'Rupees Zero Only'
  if (rupees === 0 && paise > 0) return `Rupees Zero and ${pStr} Paise Only`
  if (rupees > 0 && paise === 0) return `Rupees ${rWords} Only`
  return `Rupees ${rWords} and ${pStr} Paise Only`
}
