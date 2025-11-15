import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const OFICINA_LAT = -8.272213;
const OFICINA_LON = -35.028048;
const RAIO = 120; // metros

export function MechanicClockIn() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const baterPonto = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para bater o ponto.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setStatus('Obtendo localização...');

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não suportada pelo navegador');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const distancia = calcDistance(latitude, longitude, OFICINA_LAT, OFICINA_LON);

          if (distancia > RAIO) {
            setStatus(`Você está ${distancia.toFixed(1)}m fora da área permitida.`);
            toast({
              title: "Fora da área",
              description: `Você está ${distancia.toFixed(1)}m distante da oficina. É necessário estar dentro de ${RAIO}m.`,
              variant: "destructive"
            });
            setLoading(false);
            return;
          }

          // Registrar ponto no banco
          const { error } = await supabase
            .from('mechanic_clock_in')
            .insert({
              mechanic_id: user.id,
              latitude,
              longitude,
              distance: distancia,
              within_area: true,
              timestamp: new Date().toISOString()
            });

          if (error) throw error;

          setStatus('✅ Ponto registrado com sucesso!');
          toast({
            title: "Ponto registrado",
            description: `Localização: ${distancia.toFixed(1)}m da oficina`,
          });
          setLoading(false);
        },
        (error) => {
          setStatus('Erro ao obter localização. Permita o acesso ao GPS.');
          toast({
            title: "Erro de localização",
            description: "Não foi possível obter sua localização. Verifique as permissões do navegador.",
            variant: "destructive"
          });
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error('Erro ao bater ponto:', error);
      setStatus('Erro ao registrar ponto.');
      toast({
        title: "Erro",
        description: "Não foi possível registrar o ponto. Tente novamente.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Controle de Ponto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={baterPonto} 
            disabled={loading}
            size="lg"
            className="flex-1"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {loading ? 'Registrando...' : 'Bater Ponto'}
          </Button>
        </div>
        
        {status && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            status.includes('sucesso') 
              ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
              : status.includes('fora')
              ? 'bg-red-500/10 text-red-700 dark:text-red-400'
              : 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
          }`}>
            {status.includes('sucesso') ? (
              <CheckCircle className="h-4 w-4" />
            ) : status.includes('fora') ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            <span className="text-sm">{status}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>📍 Oficina: Lat {OFICINA_LAT}, Lon {OFICINA_LON}</p>
          <p>📏 Raio permitido: {RAIO} metros</p>
        </div>
      </CardContent>
    </Card>
  );
}
