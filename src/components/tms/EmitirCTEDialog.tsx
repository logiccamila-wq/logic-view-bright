import { VehicleSelect } from "@/components/VehicleSelect";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface EmitirCTEDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EmitirCTEDialog({ open, onOpenChange, onSuccess }: EmitirCTEDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    numero: "",
    serie: "1",
    tipo_tomador: "0",
    // Tomador
    tomador_cnpj: "",
    tomador_razao: "",
    tomador_endereco: "",
    tomador_municipio: "",
    tomador_uf: "",
    tomador_cep: "",
    // Remetente
    remetente_cnpj: "",
    remetente_razao: "",
    remetente_endereco: "",
    remetente_municipio: "",
    remetente_uf: "",
    remetente_cep: "",
    // Destinatário
    destinatario_cnpj: "",
    destinatario_razao: "",
    destinatario_endereco: "",
    destinatario_municipio: "",
    destinatario_uf: "",
    destinatario_cep: "",
    // Carga
    produto_predominante: "PRODUTOS QUIMICOS",
    quantidade_volumes: "1",
    peso_bruto: "",
    valor_carga: "",
    valor_total: "",
    // Veículo
    placa_veiculo: "",
    uf_veiculo: "PE",
    // Origem/Destino
    municipio_origem: "",
    uf_origem: "",
    municipio_destino: "",
    uf_destino: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("emitir-cte", {
        body: {
          ...formData,
          quantidade_volumes: parseInt(formData.quantidade_volumes),
          peso_bruto: parseFloat(formData.peso_bruto),
          valor_carga: parseFloat(formData.valor_carga),
          valor_total: parseFloat(formData.valor_total),
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "CT-e emitido com sucesso!",
          description: `Número: ${data.numero} | Chave: ${data.chave}`,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(data.error || "Erro ao emitir CT-e");
      }
    } catch (error: any) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao emitir CT-e",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emitir CT-e</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h3 className="font-semibold">Dados do CT-e</h3>
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

          {/* Tomador */}
          <div className="space-y-4">
            <h3 className="font-semibold">Tomador do Serviço</h3>
            <div>
              <Label>Tipo de Tomador</Label>
              <Select
                value={formData.tipo_tomador}
                onValueChange={(value) => setFormData({ ...formData, tipo_tomador: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Remetente</SelectItem>
                  <SelectItem value="1">Expedidor</SelectItem>
                  <SelectItem value="2">Recebedor</SelectItem>
                  <SelectItem value="3">Destinatário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CNPJ</Label>
                <Input
                  required
                  value={formData.tomador_cnpj}
                  onChange={(e) => setFormData({ ...formData, tomador_cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <Label>Razão Social</Label>
                <Input
                  required
                  value={formData.tomador_razao}
                  onChange={(e) => setFormData({ ...formData, tomador_razao: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label>Endereço</Label>
                <Input
                  required
                  value={formData.tomador_endereco}
                  onChange={(e) => setFormData({ ...formData, tomador_endereco: e.target.value })}
                />
              </div>
              <div>
                <Label>CEP</Label>
                <Input
                  required
                  value={formData.tomador_cep}
                  onChange={(e) => setFormData({ ...formData, tomador_cep: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Município</Label>
                <Input
                  required
                  value={formData.tomador_municipio}
                  onChange={(e) => setFormData({ ...formData, tomador_municipio: e.target.value })}
                />
              </div>
              <div>
                <Label>UF</Label>
                <Input
                  required
                  maxLength={2}
                  value={formData.tomador_uf}
                  onChange={(e) => setFormData({ ...formData, tomador_uf: e.target.value.toUpperCase() })}
                  placeholder="PE"
                />
              </div>
            </div>
          </div>

          {/* Remetente */}
          <div className="space-y-4">
            <h3 className="font-semibold">Remetente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CNPJ</Label>
                <Input
                  required
                  value={formData.remetente_cnpj}
                  onChange={(e) => setFormData({ ...formData, remetente_cnpj: e.target.value })}
                />
              </div>
              <div>
                <Label>Razão Social</Label>
                <Input
                  required
                  value={formData.remetente_razao}
                  onChange={(e) => setFormData({ ...formData, remetente_razao: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Município</Label>
                <Input
                  required
                  value={formData.remetente_municipio}
                  onChange={(e) =>
                    setFormData({ ...formData, remetente_municipio: e.target.value, municipio_origem: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>UF</Label>
                <Input
                  required
                  maxLength={2}
                  value={formData.remetente_uf}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remetente_uf: e.target.value.toUpperCase(),
                      uf_origem: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Destinatário */}
          <div className="space-y-4">
            <h3 className="font-semibold">Destinatário</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CNPJ</Label>
                <Input
                  required
                  value={formData.destinatario_cnpj}
                  onChange={(e) => setFormData({ ...formData, destinatario_cnpj: e.target.value })}
                />
              </div>
              <div>
                <Label>Razão Social</Label>
                <Input
                  required
                  value={formData.destinatario_razao}
                  onChange={(e) => setFormData({ ...formData, destinatario_razao: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Município</Label>
                <Input
                  required
                  value={formData.destinatario_municipio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destinatario_municipio: e.target.value,
                      municipio_destino: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>UF</Label>
                <Input
                  required
                  maxLength={2}
                  value={formData.destinatario_uf}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destinatario_uf: e.target.value.toUpperCase(),
                      uf_destino: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Carga e Valores */}
          <div className="space-y-4">
            <h3 className="font-semibold">Carga e Valores</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Produto</Label>
                <Input
                  value={formData.produto_predominante}
                  onChange={(e) => setFormData({ ...formData, produto_predominante: e.target.value })}
                />
              </div>
              <div>
                <Label>Volumes</Label>
                <Input
                  type="number"
                  required
                  value={formData.quantidade_volumes}
                  onChange={(e) => setFormData({ ...formData, quantidade_volumes: e.target.value })}
                />
              </div>
              <div>
                <Label>Peso Bruto (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.peso_bruto}
                  onChange={(e) => setFormData({ ...formData, peso_bruto: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor da Carga (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor_carga}
                  onChange={(e) => setFormData({ ...formData, valor_carga: e.target.value })}
                />
              </div>
              <div>
                <Label>Valor do Frete (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor_total}
                  onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Veículo */}
          <div className="space-y-4">
            <h3 className="font-semibold">Veículo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Placa</Label>
                <VehicleSelect
                  value={formData.placa_veiculo}
                  onChange={(value) => setFormData({ ...formData, placa_veiculo: value })}
                />
              </div>
              <div>
                <Label>UF</Label>
                <Input
                  required
                  maxLength={2}
                  value={formData.uf_veiculo}
                  onChange={(e) => setFormData({ ...formData, uf_veiculo: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Emitir CT-e
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
