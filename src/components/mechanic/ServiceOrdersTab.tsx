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
import { Wrench, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ServiceOrder {
  id: string;
  vehicle_plate: string;
  vehicle_model: string;
  odometer: number;
  issue_description: string;
  priority: string;
  status: string;
  mechanic_id?: string;
  mechanic_notes?: string;
  parts_used: any;
  labor_hours: number;
  estimated_completion?: string;
  completed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function ServiceOrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  const [formData, setFormData] = useState({
    vehicle_plate: '',
    vehicle_model: '',
    odometer: '',
    issue_description: '',
    priority: 'media',
  });

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar ordens:', error);
      toast.error('Erro ao carregar ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('service_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from('service_orders').insert({
        ...formData,
        odometer: parseInt(formData.odometer),
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success('Ordem de serviço criada com sucesso');
      setIsDialogOpen(false);
      setFormData({
        vehicle_plate: '',
        vehicle_model: '',
        odometer: '',
        issue_description: '',
        priority: 'media',
      });
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      toast.error('Erro ao criar ordem de serviço');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'em_andamento' && !selectedOrder?.mechanic_id) {
        updateData.mechanic_id = user?.id;
      }
      
      if (newStatus === 'concluida') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Status atualizado');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'destructive';
      case 'alta': return 'destructive';
      case 'media': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'em_andamento': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'aguardando_pecas': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <Wrench className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ordens de Serviço</h2>
          <p className="text-muted-foreground">Gerencie as manutenções e reparos da frota</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Ordem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Ordem de Serviço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicle_plate">Placa do Veículo</Label>
                  <Input
                    id="vehicle_plate"
                    value={formData.vehicle_plate}
                    onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle_model">Modelo</Label>
                  <Input
                    id="vehicle_model"
                    value={formData.vehicle_model}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="odometer">KM Atual</Label>
                  <Input
                    id="odometer"
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="issue_description">Descrição do Problema</Label>
                <Textarea
                  id="issue_description"
                  value={formData.issue_description}
                  onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                  rows={4}
                  required
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
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div>
                  <h3 className="font-bold text-lg">
                    {order.vehicle_model} - {order.vehicle_plate}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {order.odometer.toLocaleString('pt-BR')} km
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Badge variant={getPriorityColor(order.priority)}>
                  {order.priority}
                </Badge>
                <Badge variant="outline">
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <p className="text-sm mb-4">{order.issue_description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Criada {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ptBR })}
              </span>
              
              <div className="flex gap-2">
                {order.status === 'pendente' && (
                  <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'em_andamento')}>
                    Iniciar
                  </Button>
                )}
                {order.status === 'em_andamento' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order.id, 'aguardando_pecas')}>
                      Aguardar Peças
                    </Button>
                    <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'concluida')}>
                      Concluir
                    </Button>
                  </>
                )}
                {order.status === 'aguardando_pecas' && (
                  <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'em_andamento')}>
                    Retomar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}