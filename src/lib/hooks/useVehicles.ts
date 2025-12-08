import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { demoList } from '@/lib/demoStore';

export type VehicleItem = {
  plate: string;
  model?: string;
  type?: string;
  status?: string;
  mileage?: number;
};

function mapVehicle(v: any): VehicleItem {
  const plate = v?.placa || v?.plate || '';
  const model = v?.modelo || v?.model || '';
  const type = v?.tipo || v?.type || '';
  const status = v?.status || '';
  const mileage = v?.km || v?.mileage || v?.odometer || undefined;
  return { plate, model, type, status, mileage };
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const { data, error } = await supabase.from('vehicles').select('*');
      if (error) throw error;
      let mapped = (data || [])
        .map(mapVehicle)
        .filter(v => !!v.plate)
        .sort((a, b) => a.plate.localeCompare(b.plate));

      if (mapped.length === 0) {
        // Fallback to demo data if DB is empty
        const demo = demoList('vehicles') || [];
        const demoMapped = demo.map(mapVehicle);
        if (demoMapped.length > 0) {
          mapped = demoMapped;
        } else {
           // Default fallback list
           mapped = [
             { plate: 'ABC-1234', model: 'Volvo FH 540', type: 'Caminhão', status: 'Ativo' },
             { plate: 'DEF-5678', model: 'Scania R450', type: 'Caminhão', status: 'Ativo' },
             { plate: 'GHI-9012', model: 'Mercedes-Benz Actros', type: 'Caminhão', status: 'Manutenção' },
             { plate: 'JKL-3456', model: 'DAF XF', type: 'Caminhão', status: 'Ativo' },
             { plate: 'MNO-7890', model: 'Volkswagen Meteor', type: 'Caminhão', status: 'Ativo' },
             { plate: 'PQR-1234', model: 'Iveco S-Way', type: 'Caminhão', status: 'Ativo' },
             { plate: 'EJG-1234', model: 'Demo Truck', type: 'Caminhão', status: 'Ativo' }
           ];
        }
      }
      
      setVehicles(mapped);
    } catch (e: any) {
      const demo = demoList('vehicles') || [];
      const mapped = demo.map(mapVehicle);
      setVehicles(mapped.length ? mapped : [
         { plate: 'ABC-1234', model: 'Volvo FH 540', type: 'Caminhão', status: 'Ativo' },
         { plate: 'DEF-5678', model: 'Scania R450', type: 'Caminhão', status: 'Ativo' },
         { plate: 'EJG-1234', model: 'Demo Truck', type: 'Caminhão', status: 'Ativo' }
      ]);
      setError(e?.message || 'Falha ao carregar veículos');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('vehicles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getByPlate = (plate: string) => vehicles.find(v => v.plate === plate);

  return { vehicles, loading, error, refresh: load, getByPlate };
}

