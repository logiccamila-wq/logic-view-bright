import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Coordinates {
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

interface GeocodingResult {
  position: {
    lat: number;
    lon: number;
  };
  address: {
    freeformAddress: string;
    country: string;
    municipality?: string;
  };
}

export function useTomTom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calcula rota entre dois pontos usando proxy autenticado
   */
  const calculateRoute = async (
    start: Coordinates,
    end: Coordinates,
    vehicleType: 'car' | 'truck' = 'truck'
  ): Promise<RouteResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      // Use OpenRouteService via authenticated proxy
      const profile = vehicleType === 'truck' ? 'driving-hgv' : 'driving-car';
      const { data, error: invokeError } = await supabase.functions.invoke('calculate-route', {
        body: { 
          start: { lat: start.lat, lng: start.lng }, 
          end: { lat: end.lat, lng: end.lng }, 
          profile 
        }
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Erro ao calcular rota');
      }

      return data;
    } catch (err) {
      console.error('Erro ao calcular rota:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Converte endereço em coordenadas usando proxy autenticado
   */
  const geocode = async (address: string): Promise<GeocodingResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('geocode-address', {
        body: { address }
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Erro ao buscar endereço');
      }

      if (!data) {
        setError('Endereço não encontrado');
        return null;
      }

      return data;
    } catch (err) {
      console.error('Erro ao buscar endereço:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca endereço reverso (coordenadas -> endereço) usando proxy autenticado
   */
  const reverseGeocode = async (lat: number, lng: number): Promise<GeocodingResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('geocode-address', {
        body: { lat, lng }
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Erro ao buscar localização');
      }

      if (!data) {
        setError('Localização não encontrada');
        return null;
      }

      return data;
    } catch (err) {
      console.error('Erro ao buscar localização:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gera URL para tiles de mapa
   * Nota: Agora usa OpenStreetMap por padrão (público, sem necessidade de API key)
   */
  const getTileUrl = (style: 'basic' | 'hybrid' | 'labels' = 'basic'): string => {
    // Use OpenStreetMap tiles (public, no API key needed)
    return `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;
  };

  return {
    calculateRoute,
    geocode,
    reverseGeocode,
    getTileUrl,
    loading,
    error
  };
}