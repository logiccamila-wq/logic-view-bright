import { supabase } from "@/integrations/supabase/client";

/**
 * Document validation and utility functions
 */

// Constants
const VEHICLE_PLATE_REGEX = /^[A-Z]{3}-?\d{4}$/;

export interface DocumentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DocumentStatus {
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  daysUntilExpiry?: number;
  message?: string;
}

/**
 * Validate document file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileType = file.type;
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
  
  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileExt === type.substring(1);
    }
    if (type.endsWith('/*')) {
      const baseType = type.split('/')[0];
      return fileType.startsWith(baseType + '/');
    }
    return fileType === type;
  });
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(file: File, maxSizeInMB: number = 10): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Validate document data
 */
export function validateDocument(data: {
  vehicle_plate?: string;
  document_type?: string;
  file?: File;
  expiry_date?: string;
}): DocumentValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!data.vehicle_plate) {
    errors.push('Placa do veículo é obrigatória');
  } else if (!VEHICLE_PLATE_REGEX.test(data.vehicle_plate.replace(/[^A-Z0-9]/gi, '').toUpperCase())) {
    errors.push('Placa do veículo inválida (formato esperado: ABC-1234)');
  }

  if (!data.document_type) {
    errors.push('Tipo de documento é obrigatório');
  }

  if (data.file) {
    if (!validateFileSize(data.file, 10)) {
      errors.push('Arquivo muito grande (máximo 10 MB)');
    }

    const allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'];
    if (!validateFileType(data.file, allowedTypes)) {
      errors.push('Tipo de arquivo não suportado');
    }
  }

  // Expiry date validation
  if (data.expiry_date) {
    const expiryDate = new Date(data.expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      warnings.push('Documento já está vencido');
    } else {
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry <= 30) {
        warnings.push(`Documento vence em ${daysUntilExpiry} dias`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate document status based on expiry date
 */
export function getDocumentStatus(expiryDate?: string | null): DocumentStatus {
  if (!expiryDate) {
    return {
      status: 'pending',
      message: 'Data de vencimento não definida'
    };
  }

  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return {
      status: 'expired',
      daysUntilExpiry,
      message: `Vencido há ${Math.abs(daysUntilExpiry)} dias`
    };
  }

  if (daysUntilExpiry <= 30) {
    return {
      status: 'expiring',
      daysUntilExpiry,
      message: `Vence em ${daysUntilExpiry} dias`
    };
  }

  return {
    status: 'valid',
    daysUntilExpiry,
    message: `Válido por mais ${daysUntilExpiry} dias`
  };
}

/**
 * Format document type for display
 */
export function formatDocumentType(type: string): string {
  const types: Record<string, string> = {
    crlv: 'CRLV - Certificado de Registro',
    ipva: 'IPVA - Comprovante de Pagamento',
    seguro: 'Seguro do Veículo',
    licenca: 'Licença/Alvará',
    inspecao: 'Inspeção Veicular',
    manutencao: 'Ordem de Serviço/Manutenção',
    cnh: 'CNH - Carteira de Habilitação',
    tacografo: 'Disco Tacógrafo',
    antt: 'ANTT - Registro',
    outros: 'Outros Documentos'
  };

  return types[type.toLowerCase()] || type;
}

/**
 * Generate unique filename for storage
 */
export function generateStorageFileName(
  vehiclePlate: string,
  documentType: string,
  originalFileName: string
): string {
  const timestamp = Date.now();
  const sanitizedPlate = vehiclePlate.replace(/[^a-zA-Z0-9]/g, '_');
  const sanitizedType = documentType.replace(/[^a-zA-Z0-9]/g, '_');
  const fileExt = originalFileName.split('.').pop();
  
  return `${sanitizedPlate}/${sanitizedType}/${timestamp}.${fileExt}`;
}

/**
 * Upload document to Supabase Storage
 */
export async function uploadDocument(
  file: File,
  vehiclePlate: string,
  documentType: string,
  bucket: string = 'vehicle-documents'
): Promise<{ url: string; path: string } | null> {
  try {
    const fileName = generateStorageFileName(vehiclePlate, documentType, file.name);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      url: publicUrl,
      path: fileName
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    return null;
  }
}

/**
 * Delete document from Supabase Storage
 */
export async function deleteDocument(
  filePath: string,
  bucket: string = 'vehicle-documents'
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if document needs renewal (within 30 days of expiry)
 */
export function needsRenewal(expiryDate?: string | null): boolean {
  if (!expiryDate) return false;
  
  const status = getDocumentStatus(expiryDate);
  return status.status === 'expiring' || status.status === 'expired';
}

/**
 * Get documents expiring soon from database
 */
export async function getExpiringDocuments(days: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const { data, error } = await supabase
    .from('vehicle_documents')
    .select('*')
    .lte('expiry_date', futureDate.toISOString())
    .gte('expiry_date', new Date().toISOString())
    .order('expiry_date', { ascending: true });

  if (error) {
    console.error('Error fetching expiring documents:', error);
    return [];
  }

  return data || [];
}

/**
 * Get expired documents from database
 */
export async function getExpiredDocuments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('vehicle_documents')
    .select('*')
    .lt('expiry_date', today.toISOString())
    .order('expiry_date', { ascending: false });

  if (error) {
    console.error('Error fetching expired documents:', error);
    return [];
  }

  return data || [];
}

/**
 * Extract vehicle plate from filename or path
 */
export function extractPlateFromPath(path: string): string | null {
  const match = path.match(/([A-Z]{3}[-_]?\d{4})/i);
  return match ? match[1].replace('_', '-').toUpperCase() : null;
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '_')
    .replace(/_+/g, '_');
}
