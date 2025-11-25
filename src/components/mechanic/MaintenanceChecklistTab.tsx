import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ClipboardCheck, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
  notes?: string;
}

interface Checklist {
  id: string;
  vehicle_plate: string;
  checklist_type: string;
  items: any;
  status: string;
  mechanic_id?: string;
  service_order_id?: string;
  photos?: any;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

const PREVENTIVE_CHECKLIST_ITEMS = [
  { name: 'Nível de óleo do motor', checked: false },
  { name: 'Nível de líquido de arrefecimento', checked: false },
  { name: 'Nível de fluido de freio', checked: false },
  { name: 'Estado das correias', checked: false },
  { name: 'Pressão dos pneus', checked: false },
  { name: 'Estado dos pneus (desgaste)', checked: false },
  { name: 'Funcionamento das luzes', checked: false },
  { name: 'Estado das palhetas do limpador', checked: false },
  { name: 'Freios (pastilhas e discos)', checked: false },
  { name: 'Suspensão', checked: false },
  { name: 'Bateria', checked: false },
  { name: 'Filtro de ar', checked: false },
];

const CORRECTIVE_CHECKLIST_ITEMS = [
  { name: 'Identificação do problema', checked: false },
  { name: 'Testes diagnósticos realizados', checked: false },
  { name: 'Peças substituídas documentadas', checked: false },
  { name: 'Sistema testado após reparo', checked: false },
  { name: 'Verificação de problemas relacionados', checked: false },
  { name: 'Limpeza da área de trabalho', checked: false },
];

export function MaintenanceChecklistTab() {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChecklist, setActiveChecklist] = useState<Checklist | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<string>('preventiva');
  const [vehiclePlate, setVehiclePlate] = useState('');

  const ensureItemsWithIds = (items: { name: string; checked: boolean }[]) =>
    items.map((item, index) => ({
      id: (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
        ? globalThis.crypto.randomUUID()
        : `item-${index}-${Date.now()}`,
      name: item.name,
      checked: false,
    }));

  const fetchChecklists = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_checklists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChecklists(data || []);
    } catch (error) {
      console.error('Erro ao buscar checklists:', error);
      toast.error('Erro ao carregar checklists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const handleCreateChecklist = async () => {
    if (!vehiclePlate) {
      toast.error('Informe a placa do veículo');
      return;
    }

    const baseItems = createType === 'preventiva' ? PREVENTIVE_CHECKLIST_ITEMS : CORRECTIVE_CHECKLIST_ITEMS;
    const items = ensureItemsWithIds(baseItems);

    try {
      const { data, error } = await supabase
        .from('maintenance_checklists')
        .insert({
          vehicle_plate: vehiclePlate.toUpperCase(),
          checklist_type: createType,
          items: items,
          mechanic_id: user?.id,
          status: 'em_andamento',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Checklist criado com sucesso');
      setActiveChecklist(data);
      setCreateOpen(false);
      setVehiclePlate('');
      fetchChecklists();
    } catch (error) {
      console.error('Erro ao criar checklist:', error);
      toast.error('Erro ao criar checklist');
    }
  };

  const handleToggleItem = async (checklistId: string, itemId: string, checked: boolean) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

      const updatedItems = (checklist.items as ChecklistItem[]).map(item =>
      item.id === itemId ? { ...item, checked } : item
    );

    try {
      const { error } = await supabase
        .from('maintenance_checklists')
        .update({ items: updatedItems as any })
        .eq('id', checklistId);

      if (error) throw error;

      setChecklists(prev =>
        prev.map(c => c.id === checklistId ? { ...c, items: updatedItems } : c)
      );

      if (activeChecklist?.id === checklistId) {
        setActiveChecklist({ ...activeChecklist, items: updatedItems });
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const handleCompleteChecklist = async (checklistId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_checklists')
        .update({
          status: 'concluida',
          completed_at: new Date().toISOString(),
        })
        .eq('id', checklistId);

      if (error) throw error;

      toast.success('Checklist concluído');
      setActiveChecklist(null);
      fetchChecklists();
    } catch (error) {
      console.error('Erro ao concluir checklist:', error);
      toast.error('Erro ao concluir checklist');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Checklists de Manutenção</h2>
          <p className="text-muted-foreground">Gestão de inspeções preventivas e corretivas</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => { setCreateType('preventiva'); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Manutenção Preventiva
          </Button>
          <Button variant="outline" onClick={() => { setCreateType('corretiva'); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Manutenção Corretiva
          </Button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Checklist de Manutenção</DialogTitle>
            <DialogDescription>
              Informe a placa do veículo e confirme a criação.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="vehicle_plate">Placa do veículo</Label>
              <Input
                id="vehicle_plate"
                placeholder="ABC1D23"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <div className="text-sm text-muted-foreground">
                {createType === 'preventiva' ? 'Manutenção Preventiva' : 'Manutenção Corretiva'}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateChecklist}>Criar Checklist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {activeChecklist && (
        <Card className="p-6 border-2 border-primary">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold">
                Checklist Ativo - {activeChecklist.vehicle_plate}
              </h3>
              <Badge variant="secondary" className="mt-2">
                {activeChecklist.checklist_type}
              </Badge>
            </div>
            <Button onClick={() => handleCompleteChecklist(activeChecklist.id)}>
              Concluir Checklist
            </Button>
          </div>

          <div className="space-y-3">
            {(activeChecklist.items as ChecklistItem[]).map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={(checked) =>
                    handleToggleItem(activeChecklist.id, item.id, checked as boolean)
                  }
                />
                <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Progresso: {(activeChecklist.items as ChecklistItem[]).filter(i => i.checked).length} / {(activeChecklist.items as ChecklistItem[]).length} itens concluídos
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {checklists.filter(c => c.status === 'em_andamento' && c.id !== activeChecklist?.id).map((checklist) => (
          <Card key={checklist.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-bold">Veículo: {checklist.vehicle_plate}</h3>
                  <Badge variant="outline" className="mt-1">
                    {checklist.checklist_type}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <p className="text-sm text-muted-foreground">
                  {(checklist.items as ChecklistItem[]).filter(i => i.checked).length} / {(checklist.items as ChecklistItem[]).length} concluídos
                </p>
                <Button size="sm" onClick={() => setActiveChecklist(checklist)}>
                  Continuar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {checklists.filter(c => c.status === 'concluida').length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-8">Checklists Concluídos</h3>
          <div className="grid gap-4">
            {checklists.filter(c => c.status === 'concluida').map((checklist) => (
              <Card key={checklist.id} className="p-6 opacity-70">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-bold">Veículo: {checklist.vehicle_plate}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{checklist.checklist_type}</Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Concluído
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}