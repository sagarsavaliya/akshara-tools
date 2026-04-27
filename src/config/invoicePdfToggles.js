/**
 * Default visibility for GST invoice PDF sections (all on; user can turn off).
 */
export const DEFAULT_INVOICE_PDF_TOGGLES = {
  showBusinessCategory: true,
  showLogo: true,
  showLineDescription: true,
  showLineQty: true,
  showSeller: true,
  showSellerGstin: true,
  showSellerAddress: true,
  showSellerContact: true,
  showBuyer: true,
  showBuyerGstin: true,
  showBuyerAddress: true,
  showInvoiceNumber: true,
  showInvoiceDate: true,
  showDueDate: true,
  showPlaceOfSupply: true,
  showBankBlock: true,
  showLineHsn: true,
  showLineUnit: true,
  showLineGstPercent: true,
  showLineTaxable: true,
  /** Single GST amount column (intra or inter). */
  showLineGstAmount: true,
  /** Intra-state only: separate CGST / SGST columns on line items (hides combined GST column). */
  showLineCgstSgstSplit: false,
  /** Inter-state only: IGST column on line items (hides combined GST when true during inter). */
  showLineIgstColumn: true,
  showLineCess: true,
  showLineTotal: true,
  showTotalsTaxable: true,
  showTotalsCgst: true,
  showTotalsSgst: true,
  showTotalsIgst: true,
  showTotalsCess: true,
  showDiscountRow: true,
  showGrandTotal: true,
  showAmountInWords: true,
  showAuthorizedSignatory: true,
  showTermsAndConditions: true,
  showNotes: true,
}
