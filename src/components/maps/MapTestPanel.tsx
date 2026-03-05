import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTomTom } from '@/hooks/useTomTom';
import { MapPin, Navigation, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function MapTestPanel() {
  const { geocode, calculateRoute, loading } = useTomTom();
  const [testAddress, setTestAddress] = useState('Distrito Industrial Diper, Cabo de Santo Agostinho, PE');
  const [testResult, setTestResult] = useState<any>(null);

  const testGeocode = async () => {
    setTestResult(null);
    const result = await geocode(testAddress);
    
    if (result) {
      setTestResult({
        type: 'geocode',
        success: true,
        data: result
      });
      toast.success('✅ Geocoding funcionando!');
    } else {
      setTestResult({
        type: 'geocode',
        success: false
      });
      toast.error('❌ Erro no geocoding');
    }
  };

  const testRoute = async () => {
    setTestResult(null);
    
    // Rota de teste: Recife → Cabo de Santo Agostinho
    const start = { lat: -8.0476, lng: -34.8770 }; // Recife
    const end = { lat: -8.2722, lng: -35.0280 }; // Calango Molas
    
    const result = await calculateRoute(start, end, 'truck');
    
    if (result) {
      setTestResult({
        type: 'route',
        success: true,
        data: result
      });
      toast.success('✅ Roteirização funcionando!');
    } else {
      setTestResult({
        type: 'route',
        success: false
      });
      toast.error('❌ Erro na roteirização');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          Teste TomTom APIs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Teste Geocoding */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Teste Geocoding (Endereço → Coordenadas)</label>
          <div className="flex gap-2">
            <Input
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              placeholder="Digite um endereço..."
            />
            <Button onClick={testGeocode} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              Testar
            </Button>
          </div>
        </div>

        {/* Teste Roteirização */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Teste Roteirização (Recife → Cabo)</label>
          <Button onClick={testRoute} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            Calcular Rota de Teste
          </Button>
        </div>

        {/* Resultado */}
        {testResult && (
          <div className={`p-4 rounded-lg border ${
            testResult.success 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-semibold">
                {testResult.success ? 'Sucesso!' : 'Falhou'}
              </span>
            </div>

            {testResult.success && testResult.type === 'geocode' && (
              <div className="text-sm space-y-1">
                <p><strong>Endereço:</strong> {testResult.data.address.freeformAddress}</p>
                <p><strong>Coordenadas:</strong> {testResult.data.position.lat}, {testResult.data.position.lon}</p>
                <p><strong>País:</strong> {testResult.data.address.country}</p>
              </div>
            )}

            {testResult.success && testResult.type === 'route' && (
              <div className="text-sm space-y-1">
                <p><strong>Distância:</strong> {(testResult.data.distance / 1000).toFixed(2)} km</p>
                <p><strong>Tempo:</strong> {Math.round(testResult.data.duration / 60)} minutos</p>
                <p><strong>Pontos na rota:</strong> {testResult.data.geometry.coordinates.length}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
