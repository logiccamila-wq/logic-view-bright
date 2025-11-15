import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, Search } from "lucide-react";
import { toast } from "sonner";
// @ts-ignore
import BarcodeReader from "react-barcode-reader";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(true);

  const handleScan = (data: string) => {
    if (data) {
      toast.success(`Código escaneado: ${data}`);
      onScan(data);
    }
  };

  const handleError = (err: any) => {
    console.error("Erro no scanner:", err);
  };

  const handleManualSearch = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Leitor de Código de Barras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scanner automático */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Scanner Automático</span>
            <Button
              size="sm"
              variant={scanning ? "default" : "outline"}
              onClick={() => setScanning(!scanning)}
            >
              {scanning ? "Ativado" : "Desativado"}
            </Button>
          </div>
          {scanning && (
            <div className="bg-muted p-4 rounded-lg text-center">
              <Scan className="h-12 w-12 mx-auto mb-2 text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Aproxime o leitor de código de barras...
              </p>
              <BarcodeReader onScan={handleScan} onError={handleError} />
            </div>
          )}
        </div>

        {/* Entrada manual */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Busca Manual</label>
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código de barras..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleManualSearch();
              }}
            />
            <Button onClick={handleManualSearch} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
