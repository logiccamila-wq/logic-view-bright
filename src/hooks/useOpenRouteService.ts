import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RouteCoordinates {
  lat: number;
  lng: number;
}

interface RouteResponse {
  distance: number; // metros
  duration: number; // segundos
  geometry: {
    coordinates: number[][];
  };
}

export function useOpenRouteService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = async (
    start: RouteCoordinates,
    end: RouteCoordinates,
    profile: 'driving-hgv' | 'driving-car' = 'driving-hgv'
  ): Promise<RouteResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('calculate-route', {
        body: { start, end, profile }
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Erro ao calcular rota');
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMatrix = async (
    locations: RouteCoordinates[],
    profile: 'driving-hgv' | 'driving-car' = 'driving-hgv'
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Matrix calculation not yet migrated - will be added in future update
      setError('Funcionalidade de matriz temporariamente indisponível');
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculateRoute,
    getMatrix,
    loading,
    error
  };
}
