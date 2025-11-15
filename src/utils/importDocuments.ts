import { supabase } from "@/integrations/supabase/client";

interface VehicleData {
  plate: string;
  crlv_year?: number;
  civ_expiry?: string;
  cipp_expiry?: string;
  tachograph_expiry?: string;
  extinguisher_notes?: string;
  ibama_ctf_expiry?: string;
  ibama_aatipp_expiry?: string;
  antt_number?: string;
  antt_expiry?: string;
  opacity_test_expiry?: string;
  noise_test_expiry?: string;
}

// Função para converter data MM/DD/YYYY para YYYY-MM-DD
const parseDate = (dateStr: string | undefined): string | null => {
  if (!dateStr || dateStr === 'NA' || dateStr.trim() === '') return null;
  
  // Remover texto adicional e pegar apenas a data
  const cleanDate = dateStr.replace(/DATA:\s*/i, '').trim();
  
  // Se for formato MM/DD/YYYY
  const parts = cleanDate.split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return null;
};

// Dados dos veículos da planilha
export const vehiclesData: VehicleData[] = [
  // Trucks e CMs - Primeira tabela
  {
    plate: 'PFB2A13',
    crlv_year: 2024,
    civ_expiry: '4/17/2025',
    cipp_expiry: '5/7/2025',
    tachograph_expiry: '2/5/2027',
    extinguisher_notes: 'CABINE: JUNHO/2029, 1- MAIO/2025, 2- MAIO/2025',
    ibama_ctf_expiry: '5/7/2025',
    ibama_aatipp_expiry: '4/14/2025',
    antt_number: '054309677',
    antt_expiry: '06/09/2026',
    opacity_test_expiry: '4/17/2025',
    noise_test_expiry: '4/17/2025'
  },
  {
    plate: 'RCP3F78',
    crlv_year: 2024,
    civ_expiry: '6/12/2025',
    cipp_expiry: '6/12/2025',
    tachograph_expiry: '6/10/2026',
    extinguisher_notes: 'CABINE: JUNHO/2025, 1- JUNHO/2025, 2- JUNHO/2025',
    ibama_ctf_expiry: '5/7/2025',
    ibama_aatipp_expiry: '4/14/2025',
    antt_number: '055238155',
    opacity_test_expiry: '6/12/2025',
    noise_test_expiry: '6/12/2025'
  },
  {
    plate: 'PES6F45',
    crlv_year: 2024,
    civ_expiry: '9/7/2025',
    tachograph_expiry: '2/16/2027',
    extinguisher_notes: '12/31/2024',
    ibama_ctf_expiry: '5/7/2025',
    ibama_aatipp_expiry: '4/14/2025',
    antt_number: '055238155',
    opacity_test_expiry: '3/23/2025',
    noise_test_expiry: '3/23/2025'
  },
  {
    plate: 'QQN8J78',
    crlv_year: 2024,
    civ_expiry: '7/22/2025',
    tachograph_expiry: '7/20/2025',
    extinguisher_notes: '1/30/2025',
    ibama_ctf_expiry: '5/7/2025',
    ibama_aatipp_expiry: '4/14/2025',
    antt_number: '055238155',
    opacity_test_expiry: '7/22/2025',
    noise_test_expiry: '7/22/2025'
  },
  {
    plate: 'SNO6F99',
    crlv_year: 2024,
    civ_expiry: '12/4/2025',
    tachograph_expiry: '9/12/2025',
    extinguisher_notes: '6/30/2028',
    ibama_ctf_expiry: '11/11/2025',
    ibama_aatipp_expiry: '11/11/2025',
    antt_number: '055238155',
    opacity_test_expiry: '12/4/2025',
    noise_test_expiry: '12/4/2025'
  },
  {
    plate: 'QIZ3E10',
    crlv_year: 2024,
    civ_expiry: '2/25/2026',
    tachograph_expiry: '3/11/2026',
    extinguisher_notes: '12/31/2027',
    ibama_ctf_expiry: '11/5/2025',
    ibama_aatipp_expiry: '12/8/2025',
    antt_number: '055238155',
    opacity_test_expiry: '2/25/2026',
    noise_test_expiry: '2/25/2026'
  },
  {
    plate: 'SOC0G05',
    crlv_year: 2024,
    civ_expiry: '6/11/2026',
    tachograph_expiry: '7/1/2026',
    extinguisher_notes: '6/30/2029',
    ibama_ctf_expiry: '11/11/2025',
    ibama_aatipp_expiry: '12/8/2025',
    antt_number: '055238155',
    opacity_test_expiry: '6/11/2026',
    noise_test_expiry: '6/11/2026'
  },
  {
    plate: 'EGJ4B71',
    crlv_year: 2024,
    civ_expiry: '12/9/2025',
    cipp_expiry: '12/9/2025',
    tachograph_expiry: '2/11/2027',
    extinguisher_notes: 'CABINE: JUNHO/2025, 1- SETEMBRO/2025, 2- ABRIL/2026',
    ibama_ctf_expiry: '11/11/2025',
    ibama_aatipp_expiry: '11/11/2025',
    antt_number: '050835588',
    opacity_test_expiry: '12/9/2025',
    noise_test_expiry: '12/9/2025'
  },
  {
    plate: 'PEL9J12',
    crlv_year: 2024,
    civ_expiry: '11/8/2025',
    tachograph_expiry: '9/11/2025',
    extinguisher_notes: '6/30/2030',
    ibama_ctf_expiry: '11/11/2025',
    ibama_aatipp_expiry: '11/11/2025',
    antt_number: '050835588',
    opacity_test_expiry: '11/8/2025',
    noise_test_expiry: '11/8/2025'
  },
  {
    plate: 'RNS2E58',
    crlv_year: 2024
  },
  
  // Carretas - Segunda tabela
  {
    plate: 'KLU1I80',
    crlv_year: 2024,
    civ_expiry: '8/19/2025',
    cipp_expiry: '6/20/2025',
    extinguisher_notes: 'EXT 01: 30/05/2025, EXT 02: NA',
    ibama_ctf_expiry: '5/7/2025',
    ibama_aatipp_expiry: '4/14/2025',
    antt_number: '055238155'
  },
  {
    plate: 'QHM8J69',
    crlv_year: 2024,
    civ_expiry: '12/18/2025',
    cipp_expiry: '12/18/2025',
    extinguisher_notes: 'EXT 01: 31/12/2025, EXT 02: 30/04/25',
    ibama_ctf_expiry: '11/11/2025',
    ibama_aatipp_expiry: '11/11/2025',
    antt_number: '055238155'
  },
  {
    plate: 'GGJ8E57',
    crlv_year: 2025,
    civ_expiry: '6/11/2026',
    cipp_expiry: '6/11/2026',
    extinguisher_notes: 'EXT 01: 31/03/2026, EXT 02: 31/03/2026',
    ibama_ctf_expiry: '11/11/2025',
    ibama_aatipp_expiry: '12/8/2025',
    antt_number: '055238155'
  },
  {
    plate: 'EXN3I17',
    crlv_year: 2024,
    civ_expiry: '12/27/2025',
    cipp_expiry: '12/27/2025',
    extinguisher_notes: 'EXT 01: 30/01/2026, EXT 02: 30/01/2026',
    ibama_ctf_expiry: '5/7/2025',
    ibama_aatipp_expiry: '4/14/2025',
    antt_number: '055238155'
  },
  {
    plate: 'KVI1F02',
    crlv_year: 2025,
    antt_number: '055238155'
  },
  {
    plate: 'KJV2E27',
    crlv_year: 2025,
    civ_expiry: '4/23/2026',
    cipp_expiry: '2/23/2026',
    extinguisher_notes: 'EXT 01: 30/07/2026, EXT 02: 30/07/2026',
    ibama_ctf_expiry: '11/11/2025',
    ibama_aatipp_expiry: '11/11/2025',
    antt_number: '055238155'
  },
  {
    plate: 'BWY5G42',
    crlv_year: 2025,
    civ_expiry: '3/9/2026',
    cipp_expiry: '11/7/2025',
    extinguisher_notes: 'EXT 01: 30/01/2026, EXT 02: 30/10/2025',
    ibama_ctf_expiry: '11/5/2025',
    ibama_aatipp_expiry: '12/8/2025',
    antt_number: '055238155'
  },
  {
    plate: 'FLS2F62',
    crlv_year: 2024,
    civ_expiry: '8/4/2025',
    cipp_expiry: '4/15/2025',
    extinguisher_notes: 'EXT 01: 31/11/2024, EXT 02: 31/08/2025',
    ibama_ctf_expiry: '5/7/2025',
    ibama_aatipp_expiry: '4/14/2025',
    antt_number: '055238155'
  },
  {
    plate: 'SNN-5J37',
    crlv_year: 2024,
    antt_number: '055238155'
  },
  {
    plate: 'SNU0F04',
    crlv_year: 2024
  }
];

export async function importDocuments() {
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

      // CRLV
      if (vehicle.crlv_year) {
        documents.push({
          vehicle_plate: vehicle.plate,
          document_type: 'crlv',
          year: vehicle.crlv_year,
          paid: true,
          status: 'valid',
          created_by: user.id
        });
      }

      // CIV
      if (vehicle.civ_expiry) {
        const expiry = parseDate(vehicle.civ_expiry);
        documents.push({
          vehicle_plate: vehicle.plate,
          document_type: 'civ',
          expiry_date: expiry,
          status: expiry ? (new Date(expiry) > new Date() ? 'valid' : 'expired') : 'pending',
          created_by: user.id
        });
      }

      // CIPP
      if (vehicle.cipp_expiry) {
        const expiry = parseDate(vehicle.cipp_expiry);
        documents.push({
          vehicle_plate: vehicle.plate,
          document_type: 'cipp',
          expiry_date: expiry,
          status: expiry ? (new Date(expiry) > new Date() ? 'valid' : 'expired') : 'pending',
          created_by: user.id
        });
      }

      // Tacógrafo
      if (vehicle.tachograph_expiry) {
        const expiry = parseDate(vehicle.tachograph_expiry);
        documents.push({
          vehicle_plate: vehicle.plate,
          document_type: 'tachograph',
          next_check: expiry,
          status: expiry ? (new Date(expiry) > new Date() ? 'valid' : 'expired') : 'pending',
          created_by: user.id
        });
      }

      // Extintores
      if (vehicle.extinguisher_notes) {
        documents.push({
          vehicle_plate: vehicle.plate,
          document_type: 'fire_extinguisher',
          notes: vehicle.extinguisher_notes,
          status: 'valid',
          created_by: user.id
        });
      }

      // IBAMA CTF
      if (vehicle.ibama_ctf_expiry) {
        const expiry = parseDate(vehicle.ibama_ctf_expiry);
        documents.push({
          vehicle_plate: vehicle.plate,
          document_type: 'ibama_ctf',
          expiry_date: expiry,
          status: expiry ? (new Date(expiry) > new Date() ? 'valid' : 'expired') : 'pending',
          created_by: user.id
        });
      }

      // IBAMA AATIPP
      if (vehicle.ibama_aatipp_expiry) {
        const expiry = parseDate(vehicle.ibama_aatipp_expiry);
        documents.push({
          vehicle_plate: vehicle.plate,
          document_type: 'ibama_aatipp',
          expiry_date: expiry,
          status: expiry ? (new Date(expiry) > new Date() ? 'valid' : 'expired') : 'pending',
          created_by: user.id
        });
      }

      // ANTT
      if (vehicle.antt_number) {
        const expiry = parseDate(vehicle.antt_expiry);
        documents.push({
          vehicle_plate: vehicle.plate,
          document_type: 'antt',
          document_number: vehicle.antt_number,
          expiry_date: expiry,
          status: 'valid',
          created_by: user.id
        });
      }

      // Teste de Opacidade
      if (vehicle.opacity_test_expiry) {
        const expiry = parseDate(vehicle.opacity_test_expiry);
        documents.push({
          vehicle_plate: vehicle.plate,
          document_type: 'opacity_test',
          expiry_date: expiry,
          status: expiry ? (new Date(expiry) > new Date() ? 'valid' : 'expired') : 'pending',
          created_by: user.id
        });
      }

      // Teste de Ruído
      if (vehicle.noise_test_expiry) {
        const expiry = parseDate(vehicle.noise_test_expiry);
        documents.push({
          vehicle_plate: vehicle.plate,
          document_type: 'noise_test',
          expiry_date: expiry,
          status: expiry ? (new Date(expiry) > new Date() ? 'valid' : 'expired') : 'pending',
          created_by: user.id
        });
      }

      // Inserir documentos
      if (documents.length > 0) {
        console.log(`Importando ${documents.length} documentos para veículo ${vehicle.plate}`);
        console.log('Documentos:', documents);
        
        const { data, error } = await supabase
          .from('vehicle_documents')
          .insert(documents)
          .select();

        if (error) {
          console.error(`❌ Erro ao importar documentos do veículo ${vehicle.plate}:`, error);
          errorDetails.push(`${vehicle.plate}: ${error.message}`);
          errors++;
        } else {
          console.log(`✅ Importados ${documents.length} documentos do veículo ${vehicle.plate}`);
          console.log('Dados inseridos:', data);
          imported++;
        }
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
