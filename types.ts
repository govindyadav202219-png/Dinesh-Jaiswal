
export interface InvoiceLineItem {
  sr: string | null;           // Serial Number (Row-level)
  inv: string | null;          // Invoice Number (Row-level)
  dt: string | null;           // Date (Row-level)
  code: string | null;         // Code / Model
  description: string | null;  // Description / Product
  qty: number | null;          // Quantity
  uom: string | null;          // Unit of Measure
  unitPrice: number | null;    // U.P (Unit Price)
  total: number | null;        // TOT (Total)
  hsCode: string | null;       // HS Code
  coo: string | null;          // COO (Country of Origin)
  std: string | null;          // STD (Standard)
  lotNumber: string | null;    // Lot NO or Batch NO
  expDate: string | null;      // Exp Date
  fabDate: string | null;      // Fab Date
}

export interface InvoiceData {
  serialNumber: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  lineItems: InvoiceLineItem[];
}
