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

  const extractDataFromText = (text: string): Partial<VehicleData> | null => {
    // Regex patterns para extrair dados do CRLV
    const placaRegex = /(?:placa|plate)[\s:]*([A-Z]{3}[-\s]?\d{1}[A-Z0-9]{1}\d{2})/i;
    const renavamRegex = /(?:renavam)[\s:]*(\d{9,11})/i;
    const modeloRegex = /(?:marca\/modelo|modelo)[\s:]*([A-ZÀ-Ú0-9\s\/\-]+?)(?=\n|ano|placa|renavam)/i;
    const anoRegex = /(?:ano\s*(?:fabricação|modelo|fab\.\/mod\.))[\s:]*(\d{4})/i;
    const chassiRegex = /(?:chassi)[\s:]*([A-Z0-9]{17})/i;

    const placaMatch = text.match(placaRegex);
    const renavamMatch = text.match(renavamRegex);
    const modeloMatch = text.match(modeloRegex);
    const anoMatch = text.match(anoRegex);
    const chassiMatch = text.match(chassiRegex);

    if (!placaMatch) return null;

    return {
      placa: placaMatch[1].replace(/[-\s]/g, '').toUpperCase(),
      renavam: renavamMatch?.[1] || '',
      modelo: modeloMatch?.[1]?.trim() || '',
      ano: anoMatch ? parseInt(anoMatch[1]) : 0,
      chassi: chassiMatch?.[1] || '',
    };
  };

  const processZipFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const vehicles: VehicleData[] = [];

      for (const [filename, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue;
        
        // Processar apenas arquivos .txt por enquanto
        if (!filename.toLowerCase().endsWith('.txt')) continue;

        const content = await zipEntry.async('text');
        const vehicleData = extractDataFromText(content);

        if (vehicleData && vehicleData.placa) {
          vehicles.push({
            placa: vehicleData.placa,
            renavam: vehicleData.renavam || '',
            modelo: vehicleData.modelo || '',
            ano: vehicleData.ano || 0,
            chassi: vehicleData.chassi || '',
          });
        }
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