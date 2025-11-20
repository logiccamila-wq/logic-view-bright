import { VehicleSelect } from "@/components/VehicleSelect";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface EmitirMDFEDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CTe {
  id: string;
  numero_cte: string;
  chave_acesso: string;
  remetente_cidade: string;
  destinatario_cidade: string;
  valor_total: number;
  peso_bruto: number;
}

export default function EmitirMDFEDialog({ open, onOpenChange, onSuccess }: EmitirMDFEDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ctes, setCtes] = useState<CTe[]>([]);
  const [selectedCtes, setSelectedCtes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    numero: "",
    serie: "1",
    uf_inicio: "PE",
    uf_fim: "",
    ufs_percurso: "",
    placa_cavalo: "",
    uf_cavalo: "PE",
    cpf_motorista: "",
    nome_motorista: "",
  });

  useEffect(() => {
    if (open) {
      loadCTes();
    }
  }, [open]);

  const loadCTes = async () => {
    const { data, error } = await supabase
      .from("cte")
      .select("id, numero_cte, chave_acesso, remetente_cidade, destinatario_cidade, valor_total, peso_bruto")
      .eq("status", "autorizado")
      .is("trip_id", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Erro ao carregar CT-es:", error);
      return;
    }

    setCtes(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCtes.length === 0) {
      toast({
        title: "Selecione pelo menos um CT-e",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const selectedCtesData = ctes.filter((cte) => selectedCtes.includes(cte.id));
      const pesoTotal = selectedCtesData.reduce((sum, cte) => sum + cte.peso_bruto, 0);
      const valorTotal = selectedCtesData.reduce((sum, cte) => sum + cte.valor_total, 0);

      const { data, error } = await supabase.functions.invoke("emitir-mdfe", {
        body: {
          ...formData,
          quantidade_ctes: selectedCtes.length,
          peso_bruto: pesoTotal,
          valor_carga: valorTotal,
          ctes: selectedCtesData.map((cte) => ({
            chave: cte.chave_acesso,
          })),
          ufs_percurso: formData.ufs_percurso
            .split(",")
            .map((uf) => uf.trim().toUpperCase())
            .filter((uf) => uf),
          condutores: [
            {
              cpf: formData.cpf_motorista,
              nome: formData.nome_motorista,
            },
          ],
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "MDF-e emitido com sucesso!",
          description: `Número: ${data.numero} | Chave: ${data.chave}`,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(data.error || "Erro ao emitir MDF-e");
      }
    } catch (error: any) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao emitir MDF-e",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCte = (cteId: string) => {
    setSelectedCtes((prev) => (prev.includes(cteId) ? prev.filter((id) => id !== cteId) : [...prev, cteId]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emitir MDF-e</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h3 className="font-semibold">Dados do MDF-e</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número</Label>
                <Input
                  required
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="000001"
                />
              </div>
              <div>
                <Label>Série</Label>
                <Input
                  value={formData.serie}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* Percurso */}
          <div className="space-y-4">
            <h3 className="font-semibold">Percurso</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>UF Início</Label>
                <Input
                  required
                  maxLength={2}
                  value={formData.uf_inicio}
                  onChange={(e) => setFormData({ ...formData, uf_inicio: e.target.value.toUpperCase() })}
                  placeholder="PE"
                />
              </div>
              <div>
                <Label>UF Fim</Label>
                <Input
                  required
                  maxLength={2}
                  value={formData.uf_fim}
                  onChange={(e) => setFormData({ ...formData, uf_fim: e.target.value.toUpperCase() })}
                  placeholder="SP"
                />
              </div>
            </div>
            <div>
              <Label>UFs do Percurso (separadas por vírgula)</Label>
              <Input
                value={formData.ufs_percurso}
                onChange={(e) => setFormData({ ...formData, ufs_percurso: e.target.value })}
                placeholder="PE,AL,SE,BA,MG,SP"
              />
            </div>
          </div>

          {/* Veículo */}
          <div className="space-y-4">
            <h3 className="font-semibold">Veículo de Tração</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Placa</Label>
                <Input
                  required
                  value={formData.placa_cavalo}
                  onChange={(e) => setFormData({ ...formData, placa_cavalo: e.target.value.toUpperCase() })}
                  placeholder="ABC1234"
                />
              </div>
              <div>
                <Label>UF</Label>
                <Input
                  required
                  maxLength={2}
                  value={formData.uf_cavalo}
                  onChange={(e) => setFormData({ ...formData, uf_cavalo: e.target.value.toUpperCase() })}
                  placeholder="PE"
                />
              </div>
            </div>
          </div>

          {/* Motorista */}
          <div className="space-y-4">
            <h3 className="font-semibold">Condutor</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CPF</Label>
                <Input
                  required
                  value={formData.cpf_motorista}
                  onChange={(e) => setFormData({ ...formData, cpf_motorista: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label>Nome</Label>
                <Input
                  required
                  value={formData.nome_motorista}
                  onChange={(e) => setFormData({ ...formData, nome_motorista: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* CT-es Disponíveis */}
          <div className="space-y-4">
            <h3 className="font-semibold">CT-es para Vincular ({selectedCtes.length} selecionados)</h3>
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
              {ctes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum CT-e autorizado disponível</p>
              ) : (
                ctes.map((cte) => (
                  <div key={cte.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded">
                    <Checkbox checked={selectedCtes.includes(cte.id)} onCheckedChange={() => toggleCte(cte.id)} />
                    <div className="flex-1 text-sm">
                      <div className="font-medium">CT-e {cte.numero_cte}</div>
                      <div className="text-muted-foreground">
                        {cte.remetente_cidade} → {cte.destinatario_cidade} | {cte.peso_bruto}kg | R${" "}
                        {cte.valor_total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || selectedCtes.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Emitir MDF-e
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
