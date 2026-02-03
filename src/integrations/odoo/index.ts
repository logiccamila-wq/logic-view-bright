/**
 * Odoo Integration Module
 * Entry point for Odoo ERP integration
 */

export { OdooClient, createOdooClient } from './client';
export type {
  OdooConfig,
  OdooAuthResponse,
  OdooProduct,
  OdooPartner,
  OdooSaleOrder,
  OdooStockQuant,
  OdooSyncResult,
  OdooCallParams,
  OdooRPCRequest,
  OdooRPCResponse,
} from './types';
