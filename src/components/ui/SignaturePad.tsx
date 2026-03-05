import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function SignaturePad({ onSave }: { onSave: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
  }, []);

  const onDown = (e: React.MouseEvent) => { setDrawing(true); draw(e); };
  const onUp = () => setDrawing(false);
  const onMove = (e: React.MouseEvent) => drawing && draw(e);
  const draw = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext("2d")!;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const save = () => {
    const data = canvasRef.current!.toDataURL("image/png");
    onSave(data);
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
  };

  return (
    <div className="space-y-2">
      <canvas ref={canvasRef} width={480} height={160} className="border rounded-md bg-white" onMouseDown={onDown} onMouseUp={onUp} onMouseMove={onMove} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={clear}>Limpar</Button>
        <Button onClick={save}>Salvar Assinatura</Button>
      </div>
    </div>
  );
}

