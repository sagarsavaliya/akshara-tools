/**
 * Invoice industry presets — labels + optional sample terms (user can edit before PDF).
 * Inspired by common Indian GST invoice layouts (trading, manufacturing, services).
 */

export const INVOICE_BUSINESS_CATEGORIES = [
  {
    id: 'general',
    label: 'General trade & retail',
    sampleTerms: 'Payment due as per invoice date. Goods once sold will not be taken back. Subject to jurisdiction of local courts.',
  },
  {
    id: 'textiles',
    label: 'Textiles & fabrics',
    sampleTerms: 'Fabric is supplied as per sample approval. No guarantee on shrinkage beyond industry norms. Claims for defects must be raised within 7 days of delivery.',
  },
  {
    id: 'garments',
    label: 'Garments & apparel',
    sampleTerms: 'Sizes and colours as per order specification. Exchange only for manufacturing defects within 15 days with original tags.',
  },
  {
    id: 'footwear',
    label: 'Footwear & leather goods',
    sampleTerms: 'Warranty covers manufacturing defects only. Normal wear and tear excluded. Preserve original invoice for warranty claims.',
  },
  {
    id: 'automobile',
    label: 'Automobile & parts',
    sampleTerms: 'Parts supplied against chassis / part number confirmation. OEM guidelines apply for fitment. Returns only for unused parts in original packing.',
  },
  {
    id: 'electronics',
    label: 'Electronics & IT hardware',
    sampleTerms: 'Brand warranty as per manufacturer. Physical damage and liquid damage excluded. Serial numbers recorded at dispatch.',
  },
  {
    id: 'jewellery',
    label: 'Jewellery & precious metals',
    sampleTerms: 'Hallmark and purity as certified. Making charges and stone charges shown separately where applicable. All statutory declarations on record.',
  },
  {
    id: 'pharma',
    label: 'Pharmaceuticals & medicine',
    sampleTerms: 'Sale against valid prescription where applicable. Storage and cold-chain conditions as per manufacturer. Batch and expiry as per label.',
  },
  {
    id: 'fnb',
    label: 'Food & beverages',
    sampleTerms: 'FSSAI compliance maintained. Best-before / expiry as per label. Temperature-controlled handling where applicable.',
  },
  {
    id: 'agri',
    label: 'Agriculture & commodities',
    sampleTerms: 'Weight and moisture as per weighbridge / agreed norms. Mandi / APMC rules where applicable. Quality grade as per sample lot.',
  },
  {
    id: 'furniture',
    label: 'Furniture & wood products',
    sampleTerms: 'Dimensions subject to manufacturing tolerance. Natural wood grain variation is not a defect. Installation charges if any as agreed separately.',
  },
  {
    id: 'chemicals',
    label: 'Chemicals & industrial inputs',
    sampleTerms: 'MSDS available on request. Handle as per safety regulations. Hazard classification labels to be retained.',
  },
  {
    id: 'construction',
    label: 'Construction & works contract',
    sampleTerms: 'Work executed as per approved drawings and BOQ. Retention and RA bills as per contract. GST on reverse charge if applicable to be borne by recipient.',
  },
  {
    id: 'logistics',
    label: 'Logistics & transport',
    sampleTerms: 'Freight and demurrage as per tariff. LR / consignment note is proof of handover. Insurance if opted as per policy copy.',
  },
  {
    id: 'hospitality',
    label: 'Hospitality & catering',
    sampleTerms: 'Service charges if any as per display / contract. GST on restaurant services as applicable. Advance forfeiture policy as per booking terms.',
  },
  {
    id: 'professional',
    label: 'Professional & IT services',
    sampleTerms: 'Services rendered as per scope of work / SOW. Payment milestones as agreed. IP and confidentiality as per master agreement.',
  },
  {
    id: 'ecommerce',
    label: 'E-commerce & marketplace supply',
    sampleTerms: 'Dispatch against online order reference. RTO and return policy as per platform rules. IMEI / serial capture for electronics.',
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing (other)',
    sampleTerms: 'Supply against purchase order and technical specifications. Inspection at works before dispatch unless waived in writing.',
  },
]

/** @param {string} id */
export function getInvoiceCategoryById(id) {
  return INVOICE_BUSINESS_CATEGORIES.find((c) => c.id === id) || INVOICE_BUSINESS_CATEGORIES[0]
}
