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
      const { data, error: secretError } = await supabase.functions.invoke('get-secret', {
        body: { name: 'OPENROUTESERVICE_API_KEY' }
      });

      if (secretError || !data?.OPENROUTESERVICE_API_KEY) {
        throw new Error('Chave da API não configurada');
      }

      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
        {
          method: 'POST',
          headers: {
            'Authorization': data.OPENROUTESERVICE_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            coordinates: [
              [start.lng, start.lat],
              [end.lng, end.lat]
            ],
            preference: 'recommended',
            units: 'km'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao calcular rota');
      }

      const routeData = await response.json();
      const route = routeData.features[0];

      return {
        distance: route.properties.summary.distance * 1000, // km para metros
        duration: route.properties.summary.duration,
        geometry: route.geometry
      };
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
      const { data, error: secretError } = await supabase.functions.invoke('get-secret', {
        body: { name: 'OPENROUTESERVICE_API_KEY' }
      });

      if (secretError || !data?.OPENROUTESERVICE_API_KEY) {
        throw new Error('Chave da API não configurada');
      }

      const response = await fetch(
        `https://api.openrouteservice.org/v2/matrix/${profile}`,
        {
          method: 'POST',
          headers: {
            'Authorization': data.OPENROUTESERVICE_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            locations: locations.map(loc => [loc.lng, loc.lat]),
            metrics: ['distance', 'duration']
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao calcular matriz de distâncias');
      }

      return await response.json();
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
