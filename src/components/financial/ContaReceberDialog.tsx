import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ContaReceber {
  id?: string;
  descricao: string;
  cliente: string;
  valor: number;
  data_vencimento: string;
  observacoes?: string;
  status?: string;
}

interface ContaReceberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta?: ContaReceber | null;
  onSuccess: () => void;
}

export function ContaReceberDialog({ open, onOpenChange, conta, onSuccess }: ContaReceberDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContaReceber>({
    descricao: "",
    cliente: "",
    valor: 0,
    data_vencimento: "",
    observacoes: "",
    status: "pendente"
  });

  useEffect(() => {
    if (conta) {
      setFormData({
        descricao: conta.descricao || "",
        cliente: conta.cliente || "",
        valor: conta.valor || 0,
        data_vencimento: conta.data_vencimento?.split("T")[0] || "",
        observacoes: conta.observacoes || "",
        status: conta.status || "pendente"
      });
    } else {
      setFormData({
        descricao: "",
        cliente: "",
        valor: 0,
        data_vencimento: "",
        observacoes: "",
        status: "pendente"
      });
    }
  }, [conta, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.cliente || !formData.valor || !formData.data_vencimento) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        descricao: formData.descricao,
        cliente: formData.cliente,
        valor: Number(formData.valor),
        data_vencimento: formData.data_vencimento,
        observacoes: formData.observacoes || null,
        status: formData.status || "pendente"
      };

      if (conta?.id) {
        // Update
        const { error } = await supabase
          .from("contas_receber")
          .update(dataToSave)
          .eq("id", conta.id);

        if (error) throw error;
        toast.success("Conta atualizada com sucesso!");
      } else {
        // Insert
        const { error } = await supabase
          .from("contas_receber")
          .insert([dataToSave]);

        if (error) throw error;
        toast.success("Conta cadastrada com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao salvar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{conta?.id ? "Editar" : "Nova"} Conta a Receber</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Frete São Paulo - Campinas"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                placeholder="Nome do cliente"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Data Vencimento *</Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {conta?.id ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
