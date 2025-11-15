import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function TripExpenseDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "",
    descricao: "",
    valor: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criar despesa e notificação para aprovação
      const { error } = await supabase.from('contas_pagar').insert({
        fornecedor: 'Motorista',
        descricao: `${formData.tipo}: ${formData.descricao}`,
        valor: parseFloat(formData.valor),
        data_vencimento: new Date().toISOString(),
        status: 'pendente',
        categoria: 'despesas_viagem',
        created_by: user?.id
      });

      if (error) throw error;

      // Notificar gestores
      await supabase.from('notifications').insert({
        user_id: user?.id,
        title: 'Solicitação de Despesa',
        message: `Motorista solicitou aprovação de despesa: ${formData.tipo} - R$ ${formData.valor}`,
        type: 'warning',
        module: 'driver'
      });

      toast.success("Despesa enviada para aprovação!");
      setOpen(false);
      setFormData({ tipo: "", descricao: "", valor: "" });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar despesa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Receipt className="w-4 h-4 mr-2" />
          Registrar Despesa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lançamento de Despesas de Viagem</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo de Despesa</Label>
            <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="refeicao">Refeição (Kamoa)</SelectItem>
                <SelectItem value="disco_tacografo">Disco de Tacógrafo</SelectItem>
                <SelectItem value="pedagio">Pedágio</SelectItem>
                <SelectItem value="estacionamento">Estacionamento</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Descrição</Label>
            <Input
              required
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Detalhe a despesa..."
            />
          </div>
          <div>
            <Label>Valor (R$)</Label>
            <Input
              required
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Solicitar Aprovação"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
