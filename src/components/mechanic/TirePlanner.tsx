import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Pneu = {
  id: string;
  codigo: string;
  marca: string;
  modelo: string;
  medida: string;
  status: string;
  vehicle_plate: string | null;
  posicao: string | null;
};

const AXES = [
  { name: "Eixo Dianteiro", positions: ["dianteiro_esquerdo", "dianteiro_direito"] },
  { name: "Eixo Traseiro 1", positions: ["traseiro_esquerdo_externo", "traseiro_esquerdo_interno", "traseiro_direito_externo", "traseiro_direito_interno"] },
];

export function TirePlanner() {
  const [plate, setPlate] = useState("");
  const [pneus, setPneus] = useState<Pneu[]>([]);
  const [dragging, setDragging] = useState<Pneu | null>(null);

  const vehiclePneus = useMemo(() => pneus.filter(p => p.vehicle_plate === plate), [pneus, plate]);
  const estoque = useMemo(() => pneus.filter(p => !p.vehicle_plate && p.status === "estoque"), [pneus]);

  const fetchPneus = async () => {
    const { data, error } = await supabase.from("pneus" as any).select("id,codigo,marca,modelo,medida,status,vehicle_plate,posicao");
    if (error) {
      console.error(error);
      toast.error("Falha ao carregar pneus");
      return;
    }
    setPneus((data as any) || []);
  };

  useEffect(() => {
    fetchPneus();
  }, []);

  const onDrop = async (posicao: string) => {
    if (!dragging || !plate) return;
    try {
      const { error } = await supabase.from("pneus" as any).update({ status: "em_uso", vehicle_plate: plate, posicao }).eq("id", dragging.id);
      if (error) throw error;
      toast.success(`Pneu ${dragging.codigo} instalado em ${posicao}`);
      setDragging(null);
      fetchPneus();
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível instalar o pneu");
    }
  };

  const removeFromPosition = async (p: Pneu) => {
    try {
      const { error } = await supabase.from("pneus" as any).update({ status: "estoque", vehicle_plate: null, posicao: null }).eq("id", p.id);
      if (error) throw error;
      toast.success(`Pneu ${p.codigo} removido`);
      fetchPneus();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao remover pneu");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={plate} onValueChange={setPlate}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Selecione a placa" />
          </SelectTrigger>
          <SelectContent>
            {[...new Set(pneus.filter(p => p.vehicle_plate).map(p => p.vehicle_plate))]
              .filter(Boolean)
              .map((v) => (
                <SelectItem key={v as string} value={v as string}>{v}</SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button variant="modern" onClick={fetchPneus}>Atualizar</Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Estoque</h3>
            <div className="grid grid-cols-2 gap-2">
              {estoque.map((p) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => setDragging(p)}
                  className="p-2 rounded-md border cursor-grab bg-background hover:bg-accent"
                  title={`${p.codigo} • ${p.marca} ${p.modelo}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary" />
                    <div className="text-xs">
                      <div className="font-semibold">{p.codigo}</div>
                      <div className="text-muted-foreground">{p.medida}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h3 className="text-sm font-semibold">Mapa do Veículo</h3>
            {AXES.map((ax) => (
              <div key={ax.name} className="space-y-2">
                <div className="text-xs text-muted-foreground">{ax.name}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ax.positions.map((pos) => {
                    const mounted = vehiclePneus.find((p) => p.posicao === pos);
                    return (
                      <div
                        key={pos}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDrop(pos)}
                        className="relative h-20 rounded-md border bg-muted/20 flex items-center justify-center"
                        title={pos.replace(/_/g, " ")}
                      >
                        {!mounted ? (
                          <div className="text-xs text-muted-foreground">Soltar aqui</div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary" />
                            <div className="text-xs">
                              <div className="font-semibold">{mounted.codigo}</div>
                              <div className="text-muted-foreground">{mounted.medida}</div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => removeFromPosition(mounted)}>Remover</Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
