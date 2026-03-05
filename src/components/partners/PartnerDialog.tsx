import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PartnerDialog({ open, onOpenChange, onSuccess }: PartnerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    cnpj_cpf: "",
    razao_social: "",
    participacao_percentual: "",
    valor_capital_social: "",
    prolabore_mensal: "",
    observacoes: "",
  });

  const { data: socios } = useQuery({
    queryKey: ["socios-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, tipo_vinculo")
        .eq("tipo_vinculo", "SOCIO");
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("partners").insert({
        ...formData,
        participacao_percentual: parseFloat(formData.participacao_percentual),
        valor_capital_social: parseFloat(formData.valor_capital_social),
        prolabore_mensal: parseFloat(formData.prolabore_mensal),
        data_entrada: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Sócio adicionado com sucesso!");
      onOpenChange(false);
      onSuccess();
      setFormData({
        user_id: "",
        cnpj_cpf: "",
        razao_social: "",
        participacao_percentual: "",
        valor_capital_social: "",
        prolabore_mensal: "",
        observacoes: "",
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Sócio</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Usuário Sócio</Label>
            <Select value={formData.user_id} onValueChange={(value) => setFormData({...formData, user_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {socios?.map((socio) => (
                  <SelectItem key={socio.id} value={socio.id}>
                    {socio.full_name || socio.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CPF/CNPJ</Label>
              <Input
                required
                value={formData.cnpj_cpf}
                onChange={(e) => setFormData({...formData, cnpj_cpf: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Razão Social</Label>
              <Input
                value={formData.razao_social}
                onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Participação (%)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.participacao_percentual}
                onChange={(e) => setFormData({...formData, participacao_percentual: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Capital Social (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_capital_social}
                onChange={(e) => setFormData({...formData, valor_capital_social: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Pro-labore Mensal (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.prolabore_mensal}
                onChange={(e) => setFormData({...formData, prolabore_mensal: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
            />
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
