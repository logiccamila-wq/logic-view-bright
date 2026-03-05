import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import JsBarcode from "jsbarcode";

interface BarcodePrinterProps {
  partCode: string;
  partName: string;
  supplier?: string;
}

export function BarcodePrinter({ partCode, partName, supplier }: BarcodePrinterProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && partCode) {
      try {
        JsBarcode(barcodeRef.current, partCode, {
          format: "CODE128",
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
      } catch (error) {
        console.error("Erro ao gerar código de barras:", error);
      }
    }
  }, [partCode]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  return (
    <>
      <Button
        onClick={handlePrint}
        size="sm"
        variant="outline"
        className="gap-2"
      >
        <Printer className="h-4 w-4" />
      </Button>

      <div style={{ display: "none" }}>
        <div ref={componentRef} className="p-4">
          <div className="text-center space-y-2">
            <h3 className="font-bold text-lg">{partName}</h3>
            {supplier && (
              <p className="text-sm text-gray-600">Fornecedor: {supplier}</p>
            )}
            <div className="flex justify-center my-4">
              <svg ref={barcodeRef}></svg>
            </div>
            <p className="text-xs text-gray-500">Código: {partCode}</p>
          </div>
        </div>
      </div>
    </>
  );
}
