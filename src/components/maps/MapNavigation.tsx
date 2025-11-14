import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface MapNavigationProps {
  destino: string;
  destinoCoordenadas?: { lat: number; lng: number };
}

export function MapNavigation({ destino, destinoCoordenadas }: MapNavigationProps) {
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
