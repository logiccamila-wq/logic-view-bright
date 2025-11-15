import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partners: any[];
  onSuccess: () => void;
}

export function DistributionDialog({ open, onOpenChange, partners, onSuccess }: DistributionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    partner_id: "",
    tipo_distribuicao: "lucros",
    periodo_mes: new Date().getMonth() + 1,
    periodo_ano: new Date().getFullYear(),
    valor_bruto: "",
    impostos_retidos: "",
  });

  const valorLiquido = parseFloat(formData.valor_bruto || "0") - parseFloat(formData.impostos_retidos || "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("partner_distributions").insert({
        ...formData,
        valor_bruto: parseFloat(formData.valor_bruto),
        impostos_retidos: parseFloat(formData.impostos_retidos),
        valor_liquido: valorLiquido,
      });

      if (error) throw error;

      toast.success("Distribuição registrada com sucesso!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Distribuição</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Sócio</Label>
            <Select value={formData.partner_id} onValueChange={(value) => setFormData({...formData, partner_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.profiles?.full_name || partner.razao_social}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={formData.tipo_distribuicao} onValueChange={(value) => setFormData({...formData, tipo_distribuicao: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lucros">Lucros</SelectItem>
                <SelectItem value="prolabore">Pro-labore</SelectItem>
                <SelectItem value="dividendos">Dividendos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mês</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={formData.periodo_mes}
                onChange={(e) => setFormData({...formData, periodo_mes: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input
                type="number"
                value={formData.periodo_ano}
                onChange={(e) => setFormData({...formData, periodo_ano: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor Bruto (R$)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.valor_bruto}
                onChange={(e) => setFormData({...formData, valor_bruto: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Impostos Retidos (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.impostos_retidos}
                onChange={(e) => setFormData({...formData, impostos_retidos: e.target.value})}
              />
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Valor Líquido</p>
            <p className="text-2xl font-bold">
              {valorLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
