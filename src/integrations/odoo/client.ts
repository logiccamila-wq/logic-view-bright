/**
 * Odoo Integration Client
 * Client for connecting to Odoo ERP via JSON-RPC
 */

import type {
  OdooConfig,
  OdooAuthResponse,
  OdooProduct,
  OdooPartner,
  OdooSaleOrder,
  OdooStockQuant,
  OdooRPCRequest,
  OdooRPCResponse,
} from './types';

export class OdooClient {
  private config: OdooConfig;
  private sessionId: string | null = null;
  private uid: number | null = null;

  constructor(config: OdooConfig) {
    this.config = config;
  }

  /**
   * Authenticate with Odoo and get session
   */
  async authenticate(): Promise<OdooAuthResponse> {
    const request: OdooRPCRequest = {
      jsonrpc: '2.0',
      params: {
        db: this.config.database,
        login: this.config.username,
        password: this.config.apiKey,
      },
    };

    const response = await fetch(`${this.config.url}/web/session/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data: OdooRPCResponse<OdooAuthResponse> = await response.json();

    if (data.error) {
      throw new Error(`Odoo Error: ${data.error.message}`);
    }

    if (!data.result || !data.result.uid) {
      throw new Error('Authentication failed: No user ID received');
    }

    this.sessionId = data.result.session_id;
    this.uid = data.result.uid;

    return data.result;
  }

  /**
   * Generic method to call Odoo models
   */
  private async callOdoo<T = any>(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: Record<string, any> = {}
  ): Promise<T> {
    // Ensure we're authenticated
    if (!this.sessionId || !this.uid) {
      await this.authenticate();
    }

    const request: OdooRPCRequest = {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        model,
        method,
        args,
        kwargs,
      },
    };

    const response = await fetch(`${this.config.url}/web/dataset/call_kw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session_id=${this.sessionId}`,
      },
      body: JSON.stringify(request),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Odoo API call failed: ${response.statusText}`);
    }

    const data: OdooRPCResponse<T> = await response.json();

    if (data.error) {
      throw new Error(`Odoo Error: ${data.error.message}`);
    }

    return data.result as T;
  }

  /**
   * Get products from Odoo
   */
  async getProducts(filters: any = {}, fields?: string[]): Promise<OdooProduct[]> {
    const defaultFields = ['id', 'name', 'default_code', 'list_price', 'qty_available', 'categ_id', 'type'];
    return this.callOdoo<OdooProduct[]>(
      'product.product',
      'search_read',
      [filters, fields || defaultFields]
    );
  }

  /**
   * Get customers (partners with customer_rank > 0)
   */
  async getCustomers(filters: any = {}, fields?: string[]): Promise<OdooPartner[]> {
    const defaultFields = ['id', 'name', 'vat', 'email', 'phone', 'city', 'state_id', 'country_id'];
    const customerFilters = { ...filters, customer_rank: ['>', 0] };
    
    return this.callOdoo<OdooPartner[]>(
      'res.partner',
      'search_read',
      [customerFilters, fields || defaultFields]
    );
  }

  /**
   * Get suppliers (partners with supplier_rank > 0)
   */
  async getSuppliers(filters: any = {}, fields?: string[]): Promise<OdooPartner[]> {
    const defaultFields = ['id', 'name', 'vat', 'email', 'phone', 'city', 'state_id'];
    const supplierFilters = { ...filters, supplier_rank: ['>', 0] };
    
    return this.callOdoo<OdooPartner[]>(
      'res.partner',
      'search_read',
      [supplierFilters, fields || defaultFields]
    );
  }

  /**
   * Get sale orders
   */
  async getSaleOrders(filters: any = {}, fields?: string[]): Promise<OdooSaleOrder[]> {
    const defaultFields = ['id', 'name', 'partner_id', 'date_order', 'amount_total', 'state', 'invoice_status'];
    
    return this.callOdoo<OdooSaleOrder[]>(
      'sale.order',
      'search_read',
      [filters, fields || defaultFields]
    );
  }

  /**
   * Create a sale order
   */
  async createSaleOrder(data: Partial<OdooSaleOrder>): Promise<number> {
    return this.callOdoo<number>('sale.order', 'create', [data]);
  }

  /**
   * Update a sale order
   */
  async updateSaleOrder(id: number, data: Partial<OdooSaleOrder>): Promise<boolean> {
    return this.callOdoo<boolean>('sale.order', 'write', [[id], data]);
  }

  /**
   * Get stock quantities
   */
  async getStockQuantities(productIds?: number[]): Promise<OdooStockQuant[]> {
    const filters = productIds ? { product_id: ['in', productIds] } : {};
    const fields = ['id', 'product_id', 'location_id', 'quantity', 'reserved_quantity'];
    
    return this.callOdoo<OdooStockQuant[]>(
      'stock.quant',
      'search_read',
      [filters, fields]
    );
  }

  /**
   * Update stock quantity
   */
  async updateStock(productId: number, locationId: number, quantity: number): Promise<number> {
    const data = {
      product_id: productId,
      location_id: locationId,
      quantity: quantity,
    };
    
    return this.callOdoo<number>('stock.quant', 'create', [data]);
  }

  /**
   * Search records (generic)
   */
  async search(model: string, domain: any[] = []): Promise<number[]> {
    return this.callOdoo<number[]>(model, 'search', [domain]);
  }

  /**
   * Read records (generic)
   */
  async read<T = any>(model: string, ids: number[], fields?: string[]): Promise<T[]> {
    return this.callOdoo<T[]>(model, 'read', [ids, fields || []]);
  }

  /**
   * Search and read records (generic)
   */
  async searchRead<T = any>(model: string, domain: any[] = [], fields?: string[]): Promise<T[]> {
    return this.callOdoo<T[]>(model, 'search_read', [domain, fields || []]);
  }

  /**
   * Create a record (generic)
   */
  async create(model: string, data: any): Promise<number> {
    return this.callOdoo<number>(model, 'create', [data]);
  }

  /**
   * Update records (generic)
   */
  async update(model: string, ids: number[], data: any): Promise<boolean> {
    return this.callOdoo<boolean>(model, 'write', [ids, data]);
  }

  /**
   * Delete records (generic)
   */
  async delete(model: string, ids: number[]): Promise<boolean> {
    return this.callOdoo<boolean>(model, 'unlink', [ids]);
  }

  /**
   * Test connection to Odoo
   */
  async testConnection(): Promise<boolean> {
    try {
      const auth = await this.authenticate();
      return !!auth.uid;
    } catch (error) {
      console.error('Odoo connection test failed:', error);
      return false;
    }
  }
}

/**
 * Helper function to create an Odoo client instance
 */
export function createOdooClient(config: OdooConfig): OdooClient {
  return new OdooClient(config);
}
