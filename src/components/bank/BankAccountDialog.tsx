import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BankAccountDialog({ open, onOpenChange, onSuccess }: BankAccountDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_conta: "",
    banco_codigo: "",
    banco_nome: "",
    agencia: "",
    conta: "",
    tipo_conta: "corrente",
    saldo_inicial: "",
    cnpj_titular: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("bank_accounts").insert({
        ...formData,
        saldo_inicial: parseFloat(formData.saldo_inicial),
        saldo_atual: parseFloat(formData.saldo_inicial),
      });

      if (error) throw error;

      toast.success("Conta bancária adicionada com sucesso!");
      onOpenChange(false);
      onSuccess();
      setFormData({
        nome_conta: "",
        banco_codigo: "",
        banco_nome: "",
        agencia: "",
        conta: "",
        tipo_conta: "corrente",
        saldo_inicial: "",
        cnpj_titular: "",
      });
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
          <DialogTitle>Nova Conta Bancária</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Conta</Label>
            <Input
              required
              placeholder="Ex: Banco do Brasil - Conta Corrente"
              value={formData.nome_conta}
              onChange={(e) => setFormData({...formData, nome_conta: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código do Banco</Label>
              <Input
                required
                placeholder="Ex: 001"
                value={formData.banco_codigo}
                onChange={(e) => setFormData({...formData, banco_codigo: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome do Banco</Label>
              <Input
                required
                placeholder="Ex: Banco do Brasil"
                value={formData.banco_nome}
                onChange={(e) => setFormData({...formData, banco_nome: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Agência</Label>
              <Input
                required
                value={formData.agencia}
                onChange={(e) => setFormData({...formData, agencia: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Conta</Label>
              <Input
                required
                value={formData.conta}
                onChange={(e) => setFormData({...formData, conta: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Conta</Label>
            <Select value={formData.tipo_conta} onValueChange={(value) => setFormData({...formData, tipo_conta: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corrente">Conta Corrente</SelectItem>
                <SelectItem value="poupanca">Poupança</SelectItem>
                <SelectItem value="investimento">Investimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Saldo Inicial (R$)</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.saldo_inicial}
                onChange={(e) => setFormData({...formData, saldo_inicial: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ Titular</Label>
              <Input
                value={formData.cnpj_titular}
                onChange={(e) => setFormData({...formData, cnpj_titular: e.target.value})}
              />
            </div>
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
