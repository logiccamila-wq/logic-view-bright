import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OrdemColetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordem?: any;
  onSuccess?: () => void;
}

export function OrdemColetaDialog({ open, onOpenChange, ordem, onSuccess }: OrdemColetaDialogProps) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    numero_ordem: '',
    fornecedor_nome: '',
    fornecedor_cidade: '',
    fornecedor_uf: '',
    cliente_nome: '',
    cliente_cnpj: '',
    motorista_nome: '',
    motorista_telefone: '',
    placa_cavalo: '',
    placa_carreta: '',
    capacidade_carreta: '',
    produto: '',
    pedido_venda: ''
  });

  useEffect(() => {
    if (open) {
      loadVehicles();
      if (ordem) {
        setFormData({
          numero_ordem: ordem.numero_ordem || '',
          fornecedor_nome: ordem.fornecedor_nome || '',
          fornecedor_cidade: ordem.fornecedor_cidade || '',
          fornecedor_uf: ordem.fornecedor_uf || '',
          cliente_nome: ordem.cliente_nome || '',
          cliente_cnpj: ordem.cliente_cnpj || '',
          motorista_nome: ordem.motorista_nome || '',
          motorista_telefone: ordem.motorista_telefone || '',
          placa_cavalo: ordem.placa_cavalo || '',
          placa_carreta: ordem.placa_carreta || '',
          capacidade_carreta: ordem.capacidade_carreta || '',
          produto: ordem.produto || '',
          pedido_venda: ordem.pedido_venda || ''
        });
      } else {
        generateNumeroOrdem();
      }
    }
  }, [open, ordem]);

  const loadVehicles = async () => {
    const { data } = await supabase.from('vehicles').select('*').eq('status', 'ativo');
    if (data) setVehicles(data);
  };

  const generateNumeroOrdem = () => {
    const now = new Date();
    const numero = `OC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setFormData(prev => ({ ...prev, numero_ordem: numero }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (ordem) {
        const { error } = await supabase
          .from('ordem_coleta')
          .update(formData)
          .eq('id', ordem.id);
        
        if (error) throw error;
        toast.success('Ordem de coleta atualizada!');
      } else {
        const { error } = await supabase
          .from('ordem_coleta')
          .insert({ ...formData, created_by: user?.id });
        
        if (error) throw error;
        toast.success('Ordem de coleta criada!');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(error.message || 'Erro ao salvar ordem de coleta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ordem ? 'Editar' : 'Nova'} Ordem de Coleta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Número da Ordem</Label>
              <Input value={formData.numero_ordem} onChange={e => setFormData({...formData, numero_ordem: e.target.value})} required />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Fornecedor</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label>Nome</Label>
                <Input value={formData.fornecedor_nome} onChange={e => setFormData({...formData, fornecedor_nome: e.target.value})} required />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={formData.fornecedor_cidade} onChange={e => setFormData({...formData, fornecedor_cidade: e.target.value})} />
              </div>
              <div>
                <Label>UF</Label>
                <Input value={formData.fornecedor_uf} onChange={e => setFormData({...formData, fornecedor_uf: e.target.value})} maxLength={2} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Destino / Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input value={formData.cliente_nome} onChange={e => setFormData({...formData, cliente_nome: e.target.value})} required />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input value={formData.cliente_cnpj} onChange={e => setFormData({...formData, cliente_cnpj: e.target.value})} required />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Motorista</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input value={formData.motorista_nome} onChange={e => setFormData({...formData, motorista_nome: e.target.value})} required />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input value={formData.motorista_telefone} onChange={e => setFormData({...formData, motorista_telefone: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Veículos</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Placa Cavalo</Label>
                <Select value={formData.placa_cavalo} onValueChange={v => setFormData({...formData, placa_cavalo: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.filter(v => v.tipo === 'caminhao').map(v => (
                      <SelectItem key={v.id} value={v.placa}>{v.placa} - {v.modelo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Placa Carreta</Label>
                <Select value={formData.placa_carreta} onValueChange={v => setFormData({...formData, placa_carreta: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.filter(v => v.tipo === 'carreta').map(v => (
                      <SelectItem key={v.id} value={v.placa}>{v.placa} - {v.modelo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Capacidade</Label>
                <Input value={formData.capacidade_carreta} onChange={e => setFormData({...formData, capacidade_carreta: e.target.value})} placeholder="Ex: 24.000 LT - 36 TON" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Produto</Label>
              <Input value={formData.produto} onChange={e => setFormData({...formData, produto: e.target.value})} required />
            </div>
            <div>
              <Label>Pedido de Venda</Label>
              <Input value={formData.pedido_venda} onChange={e => setFormData({...formData, pedido_venda: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ordem ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}