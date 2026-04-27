/**
 * India GST planning constants (CGST/SGST/IGST split model).
 * Verify against notified rates and rounding rules before compliance use.
 */
export const GST_CONFIG = {
  LABEL: 'GST (India)',
  LAST_VERIFIED: '2026-04-26',
  /** Common headline rates (percent). */
  RATE_OPTIONS: [
    { value: 0, label: '0%' },
    { value: 5, label: '5%' },
    { value: 12, label: '12%' },
    { value: 18, label: '18%' },
    { value: 28, label: '28%' },
  ],
  /** Decimal places for GST breakdown display. */
  DISPLAY_DECIMALS: 2,
  LINE_ITEMS_MAX: 20,
  STORAGE_SELLER: 'akshara_gst_invoice_seller_v1',
  STORAGE_LOGO: 'akshara_gst_invoice_logo_b64',
  STORAGE_SEQ: 'akshara_gst_invoice_seq',
  /** Toggles, terms, notes, category, signatory (JSON). */
  STORAGE_INVOICE_PREFS: 'akshara_gst_invoice_prefs_v1',
}

/** States / UTs for seller & place of supply (same strings for comparison). */
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
].sort((a, b) => a.localeCompare(b))
