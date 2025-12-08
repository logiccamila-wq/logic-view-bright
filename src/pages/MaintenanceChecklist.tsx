import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VehicleSelect } from "@/components/VehicleSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ClipboardCheck, CheckCircle2 } from "lucide-react";

export default function MaintenanceChecklist() {
  const [plate, setPlate] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !type) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      // Simulação de criação (ou integração com backend se houver endpoint)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Checklist criado com sucesso!", {
        description: `Veículo: ${plate} | Tipo: ${type === 'corretiva' ? 'Manutenção Corretiva' : 'Manutenção Preventiva'}`
      });
      
      setPlate("");
      setType("");
    } catch (error) {
      toast.error("Erro ao criar checklist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-primary" />
            Novo Checklist de Manutenção
          </h1>
          <p className="text-muted-foreground mt-2">
            Informe a placa do veículo e confirme a criação do checklist.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Checklist</CardTitle>
            <CardDescription>Preencha as informações iniciais para abrir um novo checklist.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="plate">Placa do Veículo</Label>
                <VehicleSelect
                  value={plate}
                  onChange={setPlate}
                  placeholder="Selecione a placa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Manutenção</Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corretiva">Manutenção Corretiva</SelectItem>
                    <SelectItem value="preventiva">Manutenção Preventiva</SelectItem>
                    <SelectItem value="preditiva">Manutenção Preditiva</SelectItem>
                    <SelectItem value="inspecao">Inspeção de Rotina</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    "Criando..."
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirmar Criação
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
