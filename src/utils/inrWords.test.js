import { describe, expect, it } from 'vitest'
import { inrAmountToWords, rupeesCoreWords, under100 } from './inrWords.js'

describe('under100', () => {
  it('hyphenates composites', () => {
    expect(under100(53)).toBe('Fifty-Three')
  })
})

describe('inrAmountToWords (PRD §8.4)', () => {
  it('1,00,000', () => {
    expect(inrAmountToWords(100000)).toBe('Rupees One Lakh Only')
  })

  it('11,11,111', () => {
    expect(inrAmountToWords(1111111)).toBe(
      'Rupees Eleven Lakhs Eleven Thousand One Hundred and Eleven Only',
    )
  })

  it('1,00,00,000', () => {
    expect(inrAmountToWords(10000000)).toBe('Rupees One Crore Only')
  })

  it('₹2,553.20', () => {
    expect(inrAmountToWords(2553.2)).toBe(
      'Rupees Two Thousand Five Hundred and Fifty-Three and Twenty Paise Only',
    )
  })

  it('₹0.50', () => {
    expect(inrAmountToWords(0.5)).toBe('Rupees Zero and Fifty Paise Only')
  })
})

describe('rupeesCoreWords', () => {
  it('formats thousands', () => {
    expect(rupeesCoreWords(2553)).toBe('Two Thousand Five Hundred and Fifty-Three')
  })
})
