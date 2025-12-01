import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ContaPagar {
  id?: string;
  descricao: string;
  fornecedor: string;
  valor: number;
  data_vencimento: string;
  categoria?: string;
  observacoes?: string;
  status?: string;
}

interface ContaPagarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta?: ContaPagar | null;
  onSuccess: () => void;
}

export function ContaPagarDialog({ open, onOpenChange, conta, onSuccess }: ContaPagarDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContaPagar>({
    descricao: "",
    fornecedor: "",
    valor: 0,
    data_vencimento: "",
    categoria: "",
    observacoes: "",
    status: "pendente"
  });

  useEffect(() => {
    if (conta) {
      setFormData({
        descricao: conta.descricao || "",
        fornecedor: conta.fornecedor || "",
        valor: conta.valor || 0,
        data_vencimento: conta.data_vencimento?.split("T")[0] || "",
        categoria: conta.categoria || "",
        observacoes: conta.observacoes || "",
        status: conta.status || "pendente"
      });
    } else {
      setFormData({
        descricao: "",
        fornecedor: "",
        valor: 0,
        data_vencimento: "",
        categoria: "",
        observacoes: "",
        status: "pendente"
      });
    }
  }, [conta, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.fornecedor || !formData.valor || !formData.data_vencimento) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(formData.data_vencimento);

    if (dueDate < today) {
      toast.error("A data de vencimento não pode ser retroativa.");
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        descricao: formData.descricao,
        fornecedor: formData.fornecedor,
        valor: Number(formData.valor),
        data_vencimento: formData.data_vencimento,
        categoria: formData.categoria || null,
        observacoes: formData.observacoes || null,
        status: formData.status || "pendente"
      };

      if (conta?.id) {
        // Update
        const { error } = await supabase
          .from("contas_pagar")
          .update(dataToSave)
          .eq("id", conta.id);

        if (error) throw error;
        toast.success("Conta atualizada com sucesso!");
      } else {
        // Insert
        const { error } = await supabase
          .from("contas_pagar")
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
          <DialogTitle>{conta?.id ? "Editar" : "Nova"} Conta a Pagar</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Manutenção veículo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Input
                id="fornecedor"
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                placeholder="Nome do fornecedor"
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Combustível">Combustível</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Pedágio">Pedágio</SelectItem>
                  <SelectItem value="Folha de Pagamento">Folha de Pagamento</SelectItem>
                  <SelectItem value="Aluguel">Aluguel</SelectItem>
                  <SelectItem value="Impostos">Impostos</SelectItem>
                  <SelectItem value="Seguro">Seguro</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
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
