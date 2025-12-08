import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Droplet, Plus, Clock, CheckCircle, Camera } from 'lucide-react';
import { useVehicles } from '@/lib/hooks/useVehicles';
import { VehicleSelect } from '@/components/VehicleSelect';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Lavagem {
  id: string;
  vehicle_plate: string;
  tipo_lavagem: string;
  km: number;
  foto_antes?: string;
  foto_depois?: string;
  responsavel_id?: string;
  status: string;
  observacoes?: string;
  valor?: number;
  data_agendada?: string;
  data_inicio?: string;
  data_conclusao?: string;
  created_at: string;
  updated_at: string;
}

const TIPOS_LAVAGEM = [
  { value: 'simples', label: 'Simples', color: 'bg-blue-500' },
  { value: 'completa', label: 'Completa', color: 'bg-purple-500' },
  { value: 'interna', label: 'Interna', color: 'bg-green-500' },
  { value: 'externa', label: 'Externa', color: 'bg-yellow-500' },
  { value: 'pesado', label: 'Pesado', color: 'bg-orange-500' },
  { value: 'especial', label: 'Especial', color: 'bg-red-500' },
];

export function LavaJatoTab() {
  const { user } = useAuth();
  const { vehicles } = useVehicles();
  const [lavagens, setLavagens] = useState<Lavagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLavagem, setSelectedLavagem] = useState<Lavagem | null>(null);

  const [formData, setFormData] = useState({
    vehicle_plate: '',
    tipo_lavagem: 'simples',
    km: '',
    observacoes: '',
    valor: '',
    data_agendada: '',
  });

  const fetchLavagens = async () => {
    try {
      const { data, error } = await supabase
        .from('lavagens' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLavagens((data as any) || []);
    } catch (error) {
      console.error('Erro ao buscar lavagens:', error);
      toast.error('Erro ao carregar lavagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLavagens();

    const channel = supabase
      .channel('lavagens_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lavagens' }, () => {
        fetchLavagens();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateLavagem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('lavagens' as any).insert({
        ...formData,
        km: parseInt(formData.km),
        valor: formData.valor ? parseFloat(formData.valor) : null,
        responsavel_id: user?.id,
      } as any);

      if (error) throw error;

      toast.success('Ordem de lavagem criada com sucesso');
      setIsDialogOpen(false);
      setFormData({
        vehicle_plate: '',
        tipo_lavagem: 'simples',
        km: '',
        observacoes: '',
        valor: '',
        data_agendada: '',
      });
    } catch (error) {
      console.error('Erro ao criar lavagem:', error);
      toast.error('Erro ao criar ordem de lavagem');
    }
  };

  const handleUpdateStatus = async (lavagemId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'em_andamento') {
        updateData.data_inicio = new Date().toISOString();
      }
      
      if (newStatus === 'concluida') {
        updateData.data_conclusao = new Date().toISOString();
      }

      const { error } = await supabase
        .from('lavagens' as any)
        .update(updateData as any)
        .eq('id', lavagemId);

      if (error) throw error;

      toast.success('Status atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      agendada: 'default',
      em_andamento: 'secondary',
      concluida: 'default',
      cancelada: 'destructive',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'concluida') return CheckCircle;
    if (status === 'em_andamento') return Droplet;
    return Clock;
  };

  const getTipoColor = (tipo: string) => {
    return TIPOS_LAVAGEM.find(t => t.value === tipo)?.color || 'bg-gray-500';
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Lava-Jato</h2>
          <p className="text-muted-foreground">Gerenciar ordens de lavagem da frota</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Lavagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Lavagem</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLavagem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_plate">Placa do Veículo *</Label>
                  <VehicleSelect
                    required
                    value={formData.vehicle_plate}
                    onChange={(value) => {
                      const v = vehicles.find(x => x.plate === value);
                      setFormData({
                        ...formData,
                        vehicle_plate: value,
                        km: v?.mileage ? String(v.mileage) : formData.km,
                      });
                    }}
                    placeholder="Selecione a placa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_lavagem">Tipo de Lavagem</Label>
                  <Select
                    value={formData.tipo_lavagem}
                    onValueChange={(value) => setFormData({ ...formData, tipo_lavagem: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_LAVAGEM.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="km">Kilometragem</Label>
                  <Input
                    id="km"
                    type="number"
                    value={formData.km}
                    onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                    placeholder="120000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    placeholder="150.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_agendada">Data Agendada</Label>
                  <Input
                    id="data_agendada"
                    type="datetime-local"
                    value={formData.data_agendada}
                    onChange={(e) => setFormData({ ...formData, data_agendada: e.target.value })}
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Ordem</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {lavagens.length === 0 ? (
          <Card className="p-8 text-center">
            <Droplet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma lavagem registrada</h3>
            <p className="text-muted-foreground">Crie a primeira ordem de lavagem para começar.</p>
          </Card>
        ) : (
          lavagens.map((lavagem) => {
            const StatusIcon = getStatusIcon(lavagem.status);
            return (
              <Card key={lavagem.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${getTipoColor(lavagem.tipo_lavagem)} flex items-center justify-center`}>
                      <Droplet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{lavagem.vehicle_plate}</h3>
                      <p className="text-sm text-muted-foreground">
                        {TIPOS_LAVAGEM.find(t => t.value === lavagem.tipo_lavagem)?.label} • {lavagem.km.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(lavagem.status) as any}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {lavagem.status.replace('_', ' ')}
                  </Badge>
                </div>

                {lavagem.observacoes && (
                  <p className="text-sm text-muted-foreground mb-4">{lavagem.observacoes}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Criado {formatDistanceToNow(new Date(lavagem.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                  {lavagem.valor && (
                    <span className="font-semibold">R$ {lavagem.valor.toFixed(2)}</span>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  {lavagem.status === 'agendada' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(lavagem.id, 'em_andamento')}
                    >
                      Iniciar
                    </Button>
                  )}
                  {lavagem.status === 'em_andamento' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(lavagem.id, 'concluida')}
                    >
                      Concluir
                    </Button>
                  )}
                  {lavagem.status !== 'cancelada' && lavagem.status !== 'concluida' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateStatus(lavagem.id, 'cancelada')}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
