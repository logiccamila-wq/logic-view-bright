import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface VehiclePosition {
  id: string;
  vehicle_plate: string;
  driver_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: string;
  trip_id: string | null;
  timestamp: string;
}

export function useVehicleTracking() {
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    loadInitialPositions();

    // Setup realtime subscription
    const realtimeChannel = supabase
      .channel('vehicle-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_tracking'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            handleNewPosition(payload.new as VehiclePosition);
          } else if (payload.eventType === 'UPDATE') {
            handlePositionUpdate(payload.new as VehiclePosition);
          }
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, []);

  const loadInitialPositions = async () => {
    try {
      // Buscar última posição de cada veículo
      const { data, error } = await supabase
        .from('vehicle_tracking')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Agrupar por vehicle_plate e pegar apenas a mais recente
      const latestPositions = data?.reduce((acc: VehiclePosition[], curr) => {
        if (!acc.find(v => v.vehicle_plate === curr.vehicle_plate)) {
          acc.push(curr as VehiclePosition);
        }
        return acc;
      }, []) || [];

      setVehicles(latestPositions);
    } catch (error) {
      console.error('Erro ao carregar posições:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPosition = (position: VehiclePosition) => {
    setVehicles(prev => {
      const existing = prev.find(v => v.vehicle_plate === position.vehicle_plate);
      if (existing) {
        // Atualizar posição existente
        return prev.map(v => 
          v.vehicle_plate === position.vehicle_plate ? position : v
        );
      } else {
        // Adicionar novo veículo
        return [...prev, position];
      }
    });
  };

  const handlePositionUpdate = (position: VehiclePosition) => {
    setVehicles(prev => 
      prev.map(v => 
        v.vehicle_plate === position.vehicle_plate ? position : v
      )
    );
  };

  const updatePosition = async (
    vehiclePlate: string,
    driverId: string,
    latitude: number,
    longitude: number,
    speed: number,
    heading: number,
    status: string = 'em_transito',
    tripId?: string
  ) => {
    try {
      const { error } = await supabase
        .from('vehicle_tracking')
        .insert({
          vehicle_plate: vehiclePlate,
          driver_id: driverId,
          latitude,
          longitude,
          speed,
          heading,
          status,
          trip_id: tripId || null
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar posição:', error);
      throw error;
    }
  };

  return {
    vehicles,
    loading,
    updatePosition
  };
}
