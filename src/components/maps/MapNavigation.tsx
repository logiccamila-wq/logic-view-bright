import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation, MapPin, ExternalLink, Route, Clock } from "lucide-react";
import { toast } from "sonner";
import { useOpenRouteService } from "@/hooks/useOpenRouteService";
import { useEffect, useState } from "react";

interface MapNavigationProps {
  destino: string;
  destinoCoordenadas?: { lat: number; lng: number };
  origemCoordenadas?: { lat: number; lng: number };
}

export function MapNavigation({ destino, destinoCoordenadas, origemCoordenadas }: MapNavigationProps) {
  const { calculateRoute, loading } = useOpenRouteService();
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  useEffect(() => {
    if (origemCoordenadas && destinoCoordenadas) {
      calculateRoute(origemCoordenadas, destinoCoordenadas).then(route => {
        if (route) {
          setRouteInfo({
            distance: route.distance,
            duration: route.duration
          });
        }
      });
    }
  }, [origemCoordenadas, destinoCoordenadas]);

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h${minutes}min`;
    return `${minutes}min`;
  };

  const openGoogleMaps = () => {
    if (destinoCoordenadas) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${destinoCoordenadas.lat},${destinoCoordenadas.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`;
      window.open(url, '_blank');
    }
    toast.success('Abrindo Google Maps...');
  };

  const openWaze = () => {
    if (destinoCoordenadas) {
      const url = `https://waze.com/ul?ll=${destinoCoordenadas.lat},${destinoCoordenadas.lng}&navigate=yes`;
      window.open(url, '_blank');
    } else {
      const url = `https://waze.com/ul?q=${encodeURIComponent(destino)}&navigate=yes`;
      window.open(url, '_blank');
    }
    toast.success('Abrindo Waze...');
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Destino</p>
              <p className="font-medium">{destino}</p>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Calculando rota...</span>
            </div>
          )}

          {routeInfo && (
            <div className="flex gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Distância</p>
                  <p className="font-semibold">{formatDistance(routeInfo.distance)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Tempo estimado</p>
                  <p className="font-semibold">{formatDuration(routeInfo.duration)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={openGoogleMaps}
              className="w-full"
              variant="outline"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Google Maps
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
            <Button
              onClick={openWaze}
              className="w-full bg-[#33CCFF] hover:bg-[#2AB8E6] text-white"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Waze
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
