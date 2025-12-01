import { useState } from 'react';
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VehicleData {
  placa: string;
  renavam: string;
  modelo: string;
  ano: number;
  chassi: string;
}

export const useImportVehicles = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedVehicles, setExtractedVehicles] = useState<VehicleData[]>([]);

  const extractVehiclesFromReport = (text: string): VehicleData[] => {
    const vehicles: VehicleData[] = [];
    
    // Split by vehicle sections - cada veículo começa com "Placa:"
    const sections = text.split(/\n(?=Placa:)/);
    
    for (const section of sections) {
      if (!section.trim()) continue;
      
      // Extrair placa - formato: Placa: ABC-0000 ou Placa:\nABC-0000
      const placaMatch = section.match(/Placa:\s*\n?\s*([A-Z]{3}[-\s]?\d{1}[A-Z0-9]{1}\d{2})/i);
      if (!placaMatch) continue;
      
      // Extrair renavam - formato: Renavan: 00145643751
      const renavamMatch = section.match(/Renavan:\s*(\d{8,11})/i);
      
      // Extrair marca - formato: Marca: SCANIA
      const marcaMatch = section.match(/Marca:\s*([A-ZÀ-Ú0-9\s\/\-]+?)(?=\n|UF:|Cor:)/i);
      
      // Extrair ano - formato: Ano/Modelo: 2014
      const anoMatch = section.match(/Ano\/Modelo:\s*(\d{4})/i);
      
      // Extrair chassis - formato: No. Chassis: 9BSR6X200E3844179
      const chassiMatch = section.match(/No\.\s*Chassis:\s*([A-Z0-9]{17})/i);
      
      const placa = placaMatch[1].replace(/[-\s]/g, '').toUpperCase();
      
      // Ignorar placas de teste
      if (placa.includes('0000') || placa === 'ABC0000') continue;
      
      vehicles.push({
        placa,
        renavam: renavamMatch?.[1] || '',
        modelo: marcaMatch?.[1]?.trim() || 'Não informado',
        ano: anoMatch ? parseInt(anoMatch[1]) : new Date().getFullYear(),
        chassi: chassiMatch?.[1] || '',
      });
    }
    
    return vehicles;
  };

  const processZipFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const vehicles: VehicleData[] = [];

      const files = zip.files as Record<string, any>;
      for (const [filename, zipEntry] of Object.entries(files)) {
        if (zipEntry.dir) continue;
        
        // Processar arquivos .txt (relatórios de frota)
        if (!filename.toLowerCase().endsWith('.txt')) continue;

        const content = await zipEntry.async('text');
        const extractedVehicles = extractVehiclesFromReport(content);
        
        vehicles.push(...extractedVehicles);
      }

      if (vehicles.length === 0) {
        toast.error('Nenhum veículo válido encontrado no arquivo ZIP');
        return;
      }

      setExtractedVehicles(vehicles);
      toast.success(`${vehicles.length} veículos detectados com sucesso!`);
    } catch (error) {
      console.error('Erro ao processar ZIP:', error);
      toast.error('Erro ao processar arquivo ZIP');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmImport = async () => {
    if (extractedVehicles.length === 0) {
      toast.error('Nenhum veículo para importar');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Deletar todos os veículos existentes
      const { error: deleteError } = await supabase
        .from('vehicles')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) throw deleteError;

      // 2. Inserir novos veículos
      const { error: insertError } = await supabase
        .from('vehicles')
        .insert(extractedVehicles.map(v => ({
          placa: v.placa,
          modelo: v.modelo,
          ano: v.ano,
          tipo: 'caminhao',
          status: 'ativo',
        })));

      if (insertError) throw insertError;

      toast.success(`${extractedVehicles.length} veículos importados com sucesso!`);
      setExtractedVehicles([]);
      
      return true;
    } catch (error: any) {
      console.error('Erro ao importar veículos:', error);
      toast.error(`Erro ao importar: ${error.message}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    extractedVehicles,
    processZipFile,
    confirmImport,
    clearVehicles: () => setExtractedVehicles([]),
  };
};
