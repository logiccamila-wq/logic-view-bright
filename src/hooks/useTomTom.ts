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

  const getApiKey = async (): Promise<string | null> => {
    try {
      const { data, error: secretError } = await supabase.functions.invoke('get-secret', {
        body: { name: 'TOMTOM_API_KEY' }
      });

      if (secretError || !data?.TOMTOM_API_KEY) {
        throw new Error('Chave da API TomTom não configurada');
      }

      return data.TOMTOM_API_KEY;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter chave da API');
      return null;
    }
  };

  /**
   * Calcula rota entre dois pontos usando TomTom Routing API
   */
  const calculateRoute = async (
    start: Coordinates,
    end: Coordinates,
    vehicleType: 'car' | 'truck' = 'truck'
  ): Promise<RouteResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = await getApiKey();
      if (!apiKey) return null;

      const locations = `${start.lat},${start.lng}:${end.lat},${end.lng}`;
      const url = `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json?key=${apiKey}&vehicleEngineType=combustion${vehicleType === 'truck' ? '&vehicleCommercial=true' : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao calcular rota');
      }

      const data = await response.json();
      const route = data.routes[0];

      // Converter pontos da rota para formato [lng, lat]
      const coordinates = route.legs[0].points.map((point: any) => [
        point.longitude,
        point.latitude
      ]);

      return {
        distance: route.summary.lengthInMeters,
        duration: route.summary.travelTimeInSeconds,
        geometry: {
          coordinates
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Converte endereço em coordenadas usando TomTom Geocoding API
   */
  const geocode = async (address: string): Promise<GeocodingResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = await getApiKey();
      if (!apiKey) return null;

      const encodedAddress = encodeURIComponent(address);
      const url = `https://api.tomtom.com/search/2/geocode/${encodedAddress}.json?key=${apiKey}&limit=1&countrySet=BR`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao buscar endereço');
      }

      const data = await response.json();
      
      if (data.results.length === 0) {
        throw new Error('Endereço não encontrado');
      }

      return data.results[0];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca endereço reverso (coordenadas -> endereço)
   */
  const reverseGeocode = async (lat: number, lng: number): Promise<GeocodingResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = await getApiKey();
      if (!apiKey) return null;

      const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${apiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao buscar endereço');
      }

      const data = await response.json();
      
      if (data.addresses.length === 0) {
        throw new Error('Endereço não encontrado');
      }

      return data.addresses[0];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retorna URL para tile do mapa (Raster Map Tiles)
   */
  const getTileUrl = (apiKey: string, style: 'basic' | 'hybrid' | 'labels' = 'basic') => {
    return `https://api.tomtom.com/map/1/tile/${style}/main/{z}/{x}/{y}.png?key=${apiKey}`;
  };

  return {
    calculateRoute,
    geocode,
    reverseGeocode,
    getTileUrl,
    getApiKey,
    loading,
    error
  };
}
