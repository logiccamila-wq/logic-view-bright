import { supabase } from '@/integrations/supabase/client';

interface VehicleData {
  plate: string;
  anttExpiry?: string;
  crlvExpiry?: string;
  civExpiry?: string;
  cippExpiry?: string;
  tacografExpiry?: string;
  extinguisherExpiry?: string;
  ctfExpiry?: string;
  aatippExpiry?: string;
  opacityExpiry?: string;
  noiseExpiry?: string;
  chemicalExpiry?: string;
  cnhExpiry?: string;
}

interface DocumentPreview {
  plate: string;
  document_type: string;
  expiry_date: string | null;
  status: string;
  warnings: string[];
}

interface ImportResult {
  imported: number;
  errors: number;
  total: number;
  errorDetails: string[];
}

interface PreviewResult {
  documents: DocumentPreview[];
  warnings: string[];
  totalDocuments: number;
}

// Improved date parsing with automatic format detection
function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr || dateStr === 'NA' || dateStr === 'N/A' || dateStr === '') {
    return null;
  }

  try {
    const cleaned = dateStr.trim();
    
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    ];

    for (const format of formats) {
      const match = cleaned.match(format);
      if (match) {
        let year: number, month: number, day: number;

        if (format === formats[2]) {
          [, year, month, day] = match.map(Number);
        } else {
          const [, first, second, yearStr] = match;
          year = parseInt(yearStr);
          
          if (parseInt(first) > 12) {
            day = parseInt(first);
            month = parseInt(second);
          } else if (parseInt(second) > 12) {
            month = parseInt(first);
            day = parseInt(second);
          } else {
            month = parseInt(first);
            day = parseInt(second);
          }
        }

        if (month < 1 || month > 12 || day < 1 || day > 31) {
          console.warn(`Invalid date values: ${cleaned}`);
          return null;
        }

        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
          console.warn(`Invalid date: ${cleaned}`);
          return null;
        }

        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }

    console.warn(`Unrecognized date format: ${cleaned}`);
    return null;
  } catch (error) {
    console.error(`Error parsing date "${dateStr}":`, error);
    return null;
  }
}

function getDocumentStatus(expiryDate: string | null): string {
  if (!expiryDate) return 'pending';
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  
  if (expiry < today) return 'expired';
  
  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 30) return 'expiring';
  
  return 'valid';
}

function validateDocumentDate(dateStr: string | undefined, documentType: string): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  if (!dateStr || dateStr === 'NA' || dateStr === 'N/A') {
    return { valid: true, warnings };
  }

  const parsed = parseDate(dateStr);
  if (!parsed) {
    warnings.push(`${documentType}: formato de data inválido (${dateStr})`);
    return { valid: false, warnings };
  }

  return { valid: true, warnings };
}

export const vehiclesData: VehicleData[] = [
  { plate: 'FYB-2J16', anttExpiry: '10/31/2025', crlvExpiry: '10/31/2025', civExpiry: '10/05/2029', cippExpiry: '10/05/2029', tacografExpiry: '01/03/2027', extinguisherExpiry: '06/01/2025', ctfExpiry: '03/31/2025', aatippExpiry: '12/31/2024', opacityExpiry: '10/24/2025', noiseExpiry: '10/24/2025', chemicalExpiry: '10/24/2025' },
  { plate: 'FYB-0F07', anttExpiry: '10/31/2025', crlvExpiry: '10/31/2025', civExpiry: '10/05/2029', cippExpiry: '10/05/2029', tacografExpiry: '01/03/2027', extinguisherExpiry: '06/01/2025', ctfExpiry: '03/31/2025', aatippExpiry: '12/31/2024', opacityExpiry: '10/24/2025', noiseExpiry: '10/24/2025', chemicalExpiry: '10/24/2025' },
  { plate: 'IFW-4A83', anttExpiry: '02/28/2025', crlvExpiry: '02/29/2025', civExpiry: '03/24/2029', cippExpiry: '03/24/2029', tacografExpiry: '03/28/2027', extinguisherExpiry: '08/01/2025', ctfExpiry: '03/31/2025', aatippExpiry: '12/31/2024', opacityExpiry: '08/07/2025', noiseExpiry: '08/07/2025', chemicalExpiry: '08/07/2025', cnhExpiry: '02/25/2027' },
  { plate: 'GXQ-5738', anttExpiry: '05/31/2025', crlvExpiry: '05/31/2025', civExpiry: '05/27/2025', cippExpiry: '05/27/2025', tacografExpiry: '06/03/2027', extinguisherExpiry: '11/01/2025', ctfExpiry: '03/31/2025', aatippExpiry: '12/31/2024', opacityExpiry: '11/11/2025', noiseExpiry: '11/11/2025', chemicalExpiry: '11/11/2025', cnhExpiry: '03/04/2027' },
  { plate: 'SID-7730', anttExpiry: '08/31/2025', crlvExpiry: '08/31/2025', civExpiry: '08/01/2027', cippExpiry: '08/01/2027', tacografExpiry: '08/27/2026', extinguisherExpiry: '02/01/2026', ctfExpiry: '03/31/2025', aatippExpiry: '12/31/2024', opacityExpiry: '02/13/2026', noiseExpiry: '02/13/2026', chemicalExpiry: '02/13/2026', cnhExpiry: '09/23/2029' },
];

export async function previewImport(): Promise<PreviewResult> {
  const documents: DocumentPreview[] = [];
  const warnings: string[] = [];
  let totalDocuments = 0;

  for (const vehicle of vehiclesData) {
    const vehicleWarnings: string[] = [];

    const documentTypes = [
      { type: 'ANTT', date: vehicle.anttExpiry },
      { type: 'CRLV', date: vehicle.crlvExpiry },
      { type: 'CIV', date: vehicle.civExpiry },
      { type: 'CIPP', date: vehicle.cippExpiry },
      { type: 'Tacógrafo', date: vehicle.tacografExpiry },
      { type: 'Extintores', date: vehicle.extinguisherExpiry },
      { type: 'IBAMA CTF', date: vehicle.ctfExpiry },
      { type: 'IBAMA AATIPP', date: vehicle.aatippExpiry },
      { type: 'Opacidade', date: vehicle.opacityExpiry },
      { type: 'Ruído', date: vehicle.noiseExpiry },
      { type: 'Químicos', date: vehicle.chemicalExpiry },
      { type: 'CNH', date: vehicle.cnhExpiry },
    ];

    for (const { type, date } of documentTypes) {
      const validation = validateDocumentDate(date, type);
      vehicleWarnings.push(...validation.warnings);

      if (date && date !== 'NA') {
        const parsedDate = parseDate(date);
        const status = getDocumentStatus(parsedDate);
        
        documents.push({
          plate: vehicle.plate,
          document_type: type,
          expiry_date: parsedDate,
          status,
          warnings: validation.warnings,
        });
        totalDocuments++;
      }
    }

    if (vehicleWarnings.length > 0) {
      warnings.push(`${vehicle.plate}: ${vehicleWarnings.join(', ')}`);
    }
  }

  return {
    documents,
    warnings,
    totalDocuments,
  };
}

export async function importDocuments(dryRun: boolean = false): Promise<ImportResult> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  console.log('Iniciando importação para usuário:', user.email);
  
  let imported = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const vehicle of vehiclesData) {
    try {
      const documents: any[] = [];

      const documentTypes = [
        { type: 'ANTT', date: vehicle.anttExpiry },
        { type: 'CRLV', date: vehicle.crlvExpiry },
        { type: 'CIV', date: vehicle.civExpiry },
        { type: 'CIPP', date: vehicle.cippExpiry },
        { type: 'Tacógrafo', date: vehicle.tacografExpiry },
        { type: 'Extintores', date: vehicle.extinguisherExpiry },
        { type: 'IBAMA CTF', date: vehicle.ctfExpiry },
        { type: 'IBAMA AATIPP', date: vehicle.aatippExpiry },
        { type: 'Opacidade', date: vehicle.opacityExpiry },
        { type: 'Ruído', date: vehicle.noiseExpiry },
        { type: 'Químicos', date: vehicle.chemicalExpiry },
        { type: 'CNH', date: vehicle.cnhExpiry },
      ];

      for (const { type, date } of documentTypes) {
        if (date && date !== 'NA') {
          const expiryDate = parseDate(date);
          if (expiryDate) {
            documents.push({
              vehicle_plate: vehicle.plate,
              document_type: type,
              expiry_date: expiryDate,
              status: getDocumentStatus(expiryDate),
              created_by: user.id
            });
          }
        }
      }

      if (documents.length > 0 && !dryRun) {
        console.log(`Importando ${documents.length} documentos para veículo ${vehicle.plate}`);
        
        const { error } = await supabase
          .from('vehicle_documents')
          .insert(documents);

        if (error) {
          console.error(`❌ Erro ao importar documentos do veículo ${vehicle.plate}:`, error);
          errorDetails.push(`${vehicle.plate}: ${error.message}`);
          errors++;
        } else {
          console.log(`✅ Importados ${documents.length} documentos do veículo ${vehicle.plate}`);
          imported++;
        }
      } else if (documents.length > 0 && dryRun) {
        imported++;
      }
    } catch (error: any) {
      console.error(`❌ Erro ao processar veículo ${vehicle.plate}:`, error);
      errorDetails.push(`${vehicle.plate}: ${error.message}`);
      errors++;
    }
  }

  console.log('Importação concluída:', { imported, errors, total: vehiclesData.length });
  if (errorDetails.length > 0) {
    console.error('Detalhes dos erros:', errorDetails);
  }

  return { imported, errors, total: vehiclesData.length, errorDetails };
}
