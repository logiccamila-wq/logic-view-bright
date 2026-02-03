/**
 * Odoo Integration Types
 * Types for Odoo API integration
 */

export interface OdooConfig {
  url: string; // e.g., https://xyzlogicflow.odoo.com
  database: string;
  username: string;
  apiKey: string; // API key or password
}

export interface OdooAuthResponse {
  uid: number;
  session_id: string;
  company_id?: number;
  partner_id?: number;
  name?: string;
}

export interface OdooProduct {
  id: number;
  name: string;
  default_code?: string; // Product code/SKU
  list_price: number;
  qty_available?: number;
  categ_id?: [number, string]; // [id, name]
  uom_id?: [number, string]; // Unit of measure
  type?: 'product' | 'service' | 'consu';
  active?: boolean;
}

export interface OdooPartner {
  id: number;
  name: string;
  vat?: string; // Tax ID / CNPJ
  email?: string;
  phone?: string;
  mobile?: string;
  street?: string;
  city?: string;
  state_id?: [number, string]; // [id, name]
  zip?: string;
  country_id?: [number, string];
  customer_rank?: number;
  supplier_rank?: number;
  is_company?: boolean;
}

export interface OdooSaleOrder {
  id: number;
  name: string; // Order reference
  partner_id: [number, string]; // [id, customer name]
  date_order: string;
  amount_total: number;
  amount_untaxed?: number;
  amount_tax?: number;
  state: 'draft' | 'sent' | 'sale' | 'done' | 'cancel';
  invoice_status?: 'upselling' | 'invoiced' | 'to invoice' | 'no';
  delivery_status?: 'pending' | 'done';
  order_line?: number[]; // IDs of sale.order.line
}

export interface OdooStockQuant {
  id: number;
  product_id: [number, string];
  location_id: [number, string];
  quantity: number;
  reserved_quantity?: number;
  available_quantity?: number;
}

export interface OdooSyncResult {
  success: boolean;
  products?: number;
  customers?: number;
  orders?: number;
  errors?: string[];
  message?: string;
}

export interface OdooCallParams {
  model: string;
  method: string;
  args?: any[];
  kwargs?: Record<string, any>;
}

export interface OdooRPCRequest {
  jsonrpc: '2.0';
  method?: 'call';
  params: OdooCallParams | {
    db: string;
    login: string;
    password: string;
  };
  id?: number;
}

export interface OdooRPCResponse<T = any> {
  jsonrpc: '2.0';
  id?: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data: any;
  };
}
