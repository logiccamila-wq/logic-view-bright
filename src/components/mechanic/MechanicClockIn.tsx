import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Distrito Industrial Diper (Cabo de Santo Agostinho - PE)
const DEFAULT_LAT = -8.2783782;
const DEFAULT_LON = -35.030952;
const DEFAULT_RADIUS = 800; // metros

type PunchType = 'entrada' | 'almoco_inicio' | 'almoco_fim' | 'saida';

export function MechanicClockIn() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const { toast } = useToast();
  const { user, hasRole } = useAuth();
  const [lastPunch, setLastPunch] = useState<PunchType | null>(null);
  const [center, setCenter] = useState<{ lat: number; lon: number }>({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS);
  const [manualLat, setManualLat] = useState<string>('');
  const [manualLon, setManualLon] = useState<string>('');
  const canManualOverride = hasRole?.('admin') || hasRole?.('fleet_maintenance');

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

  // Carrega área de oficina se existir na base (fallback para DIPER)
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('workshop_area')
          .select('center_lat, center_lon, radius_meters')
          .limit(1);
        if (!error && data && data.length > 0) {
          const row = data[0];
          if (typeof row.center_lat === 'number' && typeof row.center_lon === 'number') {
            setCenter({ lat: row.center_lat, lon: row.center_lon });
          }
          if (typeof row.radius_meters === 'number' && row.radius_meters > 0) {
            setRadius(row.radius_meters);
          }
        }
      } catch {}
    })();
  }, []);

  const registerPunch = async (type: PunchType, latitude: number, longitude: number) => {
    const distancia = calcDistance(latitude, longitude, center.lat, center.lon);

    const dentroDaArea = distancia <= radius;

    const { error } = await supabase
      .from('mechanic_clock_in')
      .insert({
        mechanic_id: user?.id,
        punch_type: type,
        latitude,
        longitude,
        distance: distancia,
        within_area: dentroDaArea,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;

    if (dentroDaArea) {
      setStatus('✅ Ponto registrado com sucesso!');
      toast({
        title: "Ponto registrado",
        description: `Tipo: ${type.toUpperCase()} • Distância: ${distancia.toFixed(1)}m da oficina`,
      });
    } else {
      setStatus(`Ponto registrado fora da área (${distancia.toFixed(1)}m).`);
      toast({
        title: "Ponto liberado",
        description: `Registrado fora da área permitida (${distancia.toFixed(1)}m).`,
      });
    }

    setLastPunch(type);
    setLoading(false);
  };

  const registerPunchNoLocation = async (type: PunchType) => {
    const { error } = await supabase
      .from('mechanic_clock_in')
      .insert({
        mechanic_id: user?.id,
        punch_type: type,
        latitude: null,
        longitude: null,
        distance: null,
        within_area: false,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;

    setStatus('Ponto liberado sem localização.');
    setLastPunch(type);
    toast({
      title: "Ponto liberado",
      description: `Registrado sem GPS para ${type.toUpperCase()}.`,
    });
    setLoading(false);
  };

  const baterPonto = async (type: PunchType) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para bater o ponto.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setStatus(`Obtendo localização para ${type}...`);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocalização não suportada pelo navegador');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await registerPunch(type, latitude, longitude);
        },
        async () => {
          await registerPunchNoLocation(type);
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button onClick={() => baterPonto('entrada')} disabled={loading} size="sm" variant="default">
            <MapPin className="h-4 w-4 mr-2" /> Entrada
          </Button>
          <Button onClick={() => baterPonto('almoco_inicio')} disabled={loading} size="sm" variant="secondary">
            <MapPin className="h-4 w-4 mr-2" /> Início Almoço
          </Button>
          <Button onClick={() => baterPonto('almoco_fim')} disabled={loading} size="sm" variant="secondary">
            <MapPin className="h-4 w-4 mr-2" /> Fim Almoço
          </Button>
          <Button onClick={() => baterPonto('saida')} disabled={loading} size="sm" variant="outline">
            <MapPin className="h-4 w-4 mr-2" /> Saída
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

        {canManualOverride && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <Input placeholder="Latitude manual" value={manualLat} onChange={(e)=>setManualLat(e.target.value)} />
            <Input placeholder="Longitude manual" value={manualLon} onChange={(e)=>setManualLon(e.target.value)} />
            <Button
              size="sm"
              variant="outline"
              disabled={loading || !manualLat || !manualLon}
              onClick={async ()=>{
                setLoading(true);
                const lat = parseFloat(manualLat);
                const lon = parseFloat(manualLon);
                if (isNaN(lat) || isNaN(lon)) { setLoading(false); return; }
                await registerPunch('entrada', lat, lon);
              }}
            >
              Usar localização manual
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>📍 Oficina: Lat {center.lat}, Lon {center.lon}</p>
          <p>📏 Raio permitido: {radius} metros</p>
          {lastPunch && <p>🕒 Última marcação: {lastPunch.toUpperCase()}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
