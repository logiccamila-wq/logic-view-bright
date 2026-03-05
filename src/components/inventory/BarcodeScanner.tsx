import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, Search } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(true);
  const [buffer, setBuffer] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Listener para scanner de código de barras físico
  useEffect(() => {
    if (!scanning) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em um input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Enter indica fim da leitura do scanner
      if (e.key === "Enter" && buffer.length > 0) {
        toast.success(`Código escaneado: ${buffer}`);
        onScan(buffer);
        setBuffer("");
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        return;
      }

      // Acumula caracteres (scanners digitam muito rápido)
      if (e.key.length === 1) {
        const newBuffer = buffer + e.key;
        setBuffer(newBuffer);

        // Reset buffer após 100ms de inatividade
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setBuffer("");
        }, 100);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scanning, buffer, onScan]);

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
              {buffer && (
                <p className="text-xs text-primary mt-2">
                  Lendo: {buffer}
                </p>
              )}
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
