/** Grouped labels for PDF section toggles (keys match `invoicePdfToggles.js`). */
export const INVOICE_TOGGLE_GROUPS = [
  {
    title: 'Header',
    fields: [
      ['showBusinessCategory', 'Industry / business type under title'],
      ['showLogo', 'Company logo'],
    ],
  },
  {
    title: 'Seller',
    fields: [
      ['showSeller', 'Seller block'],
      ['showSellerGstin', 'Seller GSTIN'],
      ['showSellerAddress', 'Seller address & location'],
      ['showSellerContact', 'Seller phone & email'],
    ],
  },
  {
    title: 'Buyer',
    fields: [
      ['showBuyer', 'Buyer block'],
      ['showBuyerGstin', 'Buyer GSTIN'],
      ['showBuyerAddress', 'Buyer address & location'],
    ],
  },
  {
    title: 'Invoice details',
    fields: [
      ['showInvoiceNumber', 'Invoice number'],
      ['showInvoiceDate', 'Invoice date'],
      ['showDueDate', 'Due date'],
      ['showPlaceOfSupply', 'Place of supply'],
      ['showBankBlock', 'Bank details'],
    ],
  },
  {
    title: 'Line item columns',
    fields: [
      ['showLineDescription', 'Description'],
      ['showLineQty', 'Quantity'],
      ['showLineHsn', 'HSN/SAC'],
      ['showLineUnit', 'Unit'],
      ['showLineGstPercent', 'GST %'],
      ['showLineTaxable', 'Taxable value'],
      ['showLineGstAmount', 'GST amount (single column)'],
      ['showLineCgstSgstSplit', 'CGST & SGST columns (intra-state only)'],
      ['showLineIgstColumn', 'IGST column label (inter-state)'],
      ['showLineCess', 'Cess'],
      ['showLineTotal', 'Line total'],
    ],
  },
  {
    title: 'Totals & closing',
    fields: [
      ['showTotalsTaxable', 'Taxable amount (summary)'],
      ['showTotalsCgst', 'Total CGST'],
      ['showTotalsSgst', 'Total SGST'],
      ['showTotalsIgst', 'Total IGST'],
      ['showTotalsCess', 'Total cess'],
      ['showDiscountRow', 'Discount'],
      ['showGrandTotal', 'Grand total'],
      ['showAmountInWords', 'Amount in words'],
      ['showAuthorizedSignatory', 'Authorized signatory'],
      ['showTermsAndConditions', 'Terms & conditions'],
      ['showNotes', 'Notes'],
    ],
  },
]
