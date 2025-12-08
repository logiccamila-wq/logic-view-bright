import React, { useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { QRCodeCanvas } from 'qrcode.react';

interface PrintLabelProps {
  item: {
    part_name: string;
    part_code: string;
    barcode?: string | null;
    location?: string | null;
  };
}

export const PrintLabel = ({ item }: PrintLabelProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, item.barcode || item.part_code, {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: true,
          fontSize: 12,
          margin: 0
        });
      } catch (e) {
        console.error("Erro ao gerar barcode", e);
      }
    }
  }, [item]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  } as any);

  return (
    <>
      <div style={{ display: 'none' }}>
        <div ref={componentRef} className="p-2 border border-black w-[400px] h-[200px] flex flex-row items-center justify-between bg-white text-black">
          <div className="flex flex-col items-center justify-center w-2/3">
            <h3 className="text-sm font-bold mb-1 text-center truncate w-full">{item.part_name}</h3>
            <p className="text-xs mb-2">{item.part_code}</p>
            <canvas ref={canvasRef} />
            <p className="text-xs mt-1">{item.location || 'Sem Local'}</p>
          </div>
          <div className="flex flex-col items-center justify-center w-1/3 pl-2 border-l border-gray-300">
             <QRCodeCanvas value={item.barcode || item.part_code} size={80} />
          </div>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={handlePrint} title="Imprimir Etiqueta">
        <Printer className="w-4 h-4" />
      </Button>
    </>
  );
};
